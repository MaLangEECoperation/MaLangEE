"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { tokenStorage } from "@/features/auth";

/**
 * WebSocket 메시지 타입
 */
export type ScenarioMessageType =
  | "ready"
  | "speech.started"      // 사용자 말하기 시작
  | "audio.delta"         // AI 오디오 데이터
  | "audio.done"          // AI 오디오 완료
  | "transcript.done"     // AI 텍스트 (말풍선)
  | "user.transcript"     // 사용자 텍스트 (말풍선)
  | "input_audio.transcript" // [호환성] 사용자 STT
  | "session.report"      // 종료 리포트
  | "scenario.completed"  // [호환성] 종료 리포트
  | "text"                // [호환성] 구형 텍스트 메시지
  | "message"             // [호환성] 구형 메시지
  | "error";

export interface ScenarioMessage {
  type: ScenarioMessageType;
  audio?: string;         // audio.delta (혹은 delta)
  delta?: string;         // audio.delta 호환용
  transcript?: string;    // transcript.done, user.transcript
  text?: string;          // [호환성] text 메시지
  content?: string;       // [호환성] message 내용
  sample_rate?: number;
  message?: string;       // error message
  completed?: boolean;    // scenario.completed
  json?: {                // scenario.completed (호환)
    place?: string;
    conversation_partner?: string;
    conversation_goal?: string;
    sessionId?: string;
  };
  report?: {              // session.report
    place?: string;
    conversation_partner?: string;
    conversation_goal?: string;
    [key: string]: any;
  };
}

export interface ScenarioChatState {
  isConnected: boolean;
  isReady: boolean;
  aiMessage: string;
  userTranscript: string;
  isAiSpeaking: boolean;
  error: string | null;
  scenarioInfo: {
    place?: string;
    conversationPartner?: string;
    conversationGoal?: string;
  } | null;
}

/**
 * 시나리오 대화 WebSocket 훅
 * 실제 LLM과 WebSocket으로 통신
 */
export function useScenarioChat() {
  const [state, setState] = useState<ScenarioChatState>({
    isConnected: false,
    isReady: false,
    aiMessage: "",
    userTranscript: "",
    isAiSpeaking: false,
    error: null,
    scenarioInfo: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null); // 현재 재생 중인 소스 추적
  const connectionIdRef = useRef(0); // 연결 ID로 stale closure 방지

  /**
   * WebSocket URL 생성
   */
  const getWebSocketUrl = useCallback(() => {
    const token = tokenStorage.get();

    // 1. 환경 변수에서 WS URL 확인 (최우선)
    const envWsUrl = process.env.NEXT_PUBLIC_WS_URL;
    let wsBaseUrl = envWsUrl;

    // 2. WS URL이 없고 API URL만 있다면 API URL 기반으로 생성
    if (!wsBaseUrl && process.env.NEXT_PUBLIC_API_URL) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      // 기본적으로 http->ws, https->wss 변환
      wsBaseUrl = apiUrl.replace(/^http/, "ws");

      // [보안 수정] 현재 페이지가 HTTPS라면, API URL 설정과 관계없이 무조건 WSS를 사용해야 함
      // (Mixed Content SecurityError 방지)
      if (window.location.protocol === "https:" && wsBaseUrl.startsWith("ws:")) {
        wsBaseUrl = wsBaseUrl.replace(/^ws:/, "wss:");
      }
    }

    // 3. 둘 다 없다면 현재 브라우저 호스트 기준 (Fallback)
    if (!wsBaseUrl) {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : "";

      // 로컬호스트 개발 환경인 경우에만 8080 포트를 기본값으로 고려
      // (Next.js 3000 -> Django 8080 개발 패턴)
      if (host === "localhost" || host === "127.0.0.1") {
        wsBaseUrl = `${protocol}://${host}:8080`;
      } else {
        // 프로덕션 환경(도메인 사용)에서는 현재 호스트/포트(443/80)를 그대로 사용
        // 백엔드가 같은 도메인/포트로 서빙된다고 가정 (예: Nginx Proxy)
        wsBaseUrl = `${protocol}://${host}${port}`;
      }
    }

    const url = token
      ? `${wsBaseUrl}/api/v1/ws/scenario?token=${encodeURIComponent(token)}`
      : `${wsBaseUrl}/api/v1/ws/guest-scenario`;

    return url;
  }, []);

  /**
   * Base64 → Uint8Array
   */
  const base64ToBytes = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  };

  /**
   * PCM16 → Float32 (재생용)
   */
  const pcm16ToFloat32 = (bytes: Uint8Array): Float32Array => {
    const samples = new Float32Array(Math.floor(bytes.length / 2));
    for (let i = 0; i < samples.length; i++) {
      const lo = bytes[i * 2];
      const hi = bytes[i * 2 + 1];
      let sample = (hi << 8) | lo;
      if (sample >= 0x8000) sample -= 0x10000;
      samples[i] = sample / 32768;
    }
    return samples;
  };

  /**
   * Float32 → PCM16 (전송용)
   */
  const float32ToPCM16 = (float32: Float32Array): Uint8Array => {
    const buffer = new ArrayBuffer(float32.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32.length; i++) {
      let sample = Math.max(-1, Math.min(1, float32[i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(i * 2, sample, true);
    }
    return new Uint8Array(buffer);
  };

  /**
   * Uint8Array → Base64
   */
  const bytesToBase64 = (bytes: Uint8Array): string => {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  /**
   * 오디오 컨텍스트 초기화 (사용자 인터랙션 필요)
   */
  /**
   * 오디오 컨텍스트 초기화 (사용자 인터랙션 필요)
   */
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      // AudioContext 생성 (브라우저 기본 샘플레이트 사용 권장)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass(); // sampleRate 옵션 제거 (호환성 향상)
      console.log("[Audio] AudioContext created. Rate:", audioContextRef.current.sampleRate);
    }

    if (audioContextRef.current.state === "suspended") {
      console.log("[Audio] Resuming AudioContext...");
      audioContextRef.current.resume().then(() => {
        console.log("[Audio] AudioContext resumed successfully.");
      }).catch((err) => {
        console.warn("[Audio] Failed to resume audio context:", err);
      });
    }
  }, []);

  /**
   * 오디오 재생
   */
  const playAudio = useCallback(async (base64Audio: string, sampleRate: number = 24000) => {
    try {
      if (!base64Audio) {
        console.warn("[Audio] Received empty audio data.");
        return;
      }

      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        console.log("[Audio] (Auto-create) AudioContext created. Rate:", audioContextRef.current.sampleRate);
      }

      // 재생 전 상태 확인 및 재개 시도
      if (audioContextRef.current.state === "suspended") {
        console.log("[Audio] Context suspended. Attempting resume...");
        await audioContextRef.current.resume();
      }

      const bytes = base64ToBytes(base64Audio);
      // const float32 = pcm16ToFloat32(bytes);
      // Float32 변환 로그 확인
      const float32 = pcm16ToFloat32(bytes);

      // [Debug] 오디오 데이터 통계
      // let maxVal = 0;
      // for(let i=0; i<float32.length; i+=100) if(Math.abs(float32[i]) > maxVal) maxVal = Math.abs(float32[i]);
      // console.log(`[Audio] Queuing chunk. Bytes: ${bytes.length}, Samples: ${float32.length}, MaxAmp: ${maxVal.toFixed(4)}, CtxState: ${audioContextRef.current.state}`);

      audioQueueRef.current.push(float32);

      if (!isPlayingRef.current) {
        isPlayingRef.current = true;
        setState((prev) => ({ ...prev, isAiSpeaking: true }));
        await playNextAudio();
      }
    } catch (error) {
      console.error("[Audio] Failed to play audio:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playNextAudio = async () => {
    if (audioQueueRef.current.length === 0) {
      // console.log("[Audio] Queue empty. Playback finished.");
      isPlayingRef.current = false;
      setState((prev) => ({ ...prev, isAiSpeaking: false }));
      return;
    }

    const float32 = audioQueueRef.current.shift()!;
    const audioContext = audioContextRef.current!;

    // 중요: buffer의 sampleRate를 명시적으로 24000(또는 수신된 값)으로 설정해야
    // 하드웨어가 48000이어도 브라우저가 알아서 리샘플링하여 정상 속도로 재생함.
    const playbackRate = 24000; // 기본적으로 서버가 24k로 보낸다고 가정
    const audioBuffer = audioContext.createBuffer(1, float32.length, playbackRate);
    audioBuffer.getChannelData(0).set(float32);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.onended = () => {
      // 현재 소스가 끝났을 때만 다음 오디오 재생
      if (activeSourceRef.current === source) {
        activeSourceRef.current = null;
        playNextAudio();
      }
    };
    source.start();
    activeSourceRef.current = source;
    // console.log("[Audio] Playing chunk...", float32.length);
  };

  /**
   * 오디오 재생 중단 (Barge-in)
   */
  const stopAudio = useCallback(() => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch (e) {
        // ignore
      }
      activeSourceRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setState((prev) => ({ ...prev, isAiSpeaking: false }));
  }, []);

  /**
   * WebSocket 메시지 핸들러
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: ScenarioMessage = JSON.parse(event.data);
        console.log("[WebSocket] Received:", message.type, message);

        switch (message.type) {
          case "ready":
            setState((prev) => ({ ...prev, isReady: true, error: null }));
            break;

          case "speech.started":
            // 사용자가 말하기 시작함 -> AI 오디오 즉시 중단 (Barge-in)
            console.log("[WebSocket] Barge-in triggered by speech.started");
            stopAudio();
            // "듣는 중" 상태 표시 등은 상위 컴포넌트(isAiSpeaking=false)에서 처리됨
            break;

          case "audio.delta":
            // AI 목소리 데이터 (audio 필드 혹은 delta 필드 확인)
            const audioData = message.audio || message.delta;
            if (audioData) {
              const rate = message.sample_rate || 24000;
              playAudio(audioData, rate);
            }
            break;

          case "audio.done":
            // AI 목소리 재생 끝 (필요 시 처리)
            break;

          case "transcript.done":
            // AI 텍스트 완료 (AI 말풍선)
            if (message.transcript) {
              setState((prev) => ({ ...prev, aiMessage: message.transcript || "" }));
            }
            break;

          case "text":
            // [호환성] AI 텍스트 메시지 ({"type":"text", "text":"..."})
            if (message.text) {
              setState((prev) => ({ ...prev, aiMessage: message.text || "" }));
            }
            break;

          case "message":
            // [호환성] 기존 message 타입
            if (message.content) {
              setState((prev) => ({ ...prev, aiMessage: message.content || "" }));
            }
            break;

          case "user.transcript":
          case "input_audio.transcript": // [호환성] 추가
            // 사용자 텍스트 (내 말풍선)
            if (message.transcript) {
              setState((prev) => ({ ...prev, userTranscript: message.transcript || "" }));
            }
            break;

          case "session.report":
          case "scenario.completed": // [호환성] 추가
            // 세션 종료 리포트
            const reportData = message.report || message.json;
            if (reportData) {
              setState((prev) => ({
                ...prev,
                scenarioInfo: {
                  place: reportData.place,
                  conversationPartner: reportData.conversation_partner,
                  conversationGoal: reportData.conversation_goal,
                },
              }));
            }
            break;

          case "error":
            setState((prev) => ({ ...prev, error: message.message || "Unknown error" }));
            console.error("[WebSocket] Error:", message.message);
            break;

          default:
            console.warn("[WebSocket] Unhandled message type:", message.type);
            break;
        }
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    },
    [playAudio]
  );

  /**
   * WebSocket 연결
   */
  const connect = useCallback(() => {
    // 새 연결 ID 생성 (이전 연결의 이벤트 무시용)
    const currentConnectionId = ++connectionIdRef.current;

    // [방어 로직] 이미 연결되었거나 연결 중이라면 패스
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        console.log("[WebSocket] Connection already active. Skipping new connection.");
        return;
      }
      // 닫혀있는 소켓 인스턴스가 남아있다면 정리
      wsRef.current = null;
    }

    try {
      const url = getWebSocketUrl();
      const ws = new WebSocket(url);

      ws.onopen = () => {
        // 현재 연결 ID가 최신인지 확인
        if (connectionIdRef.current !== currentConnectionId) {
          ws.close();
          return;
        }
        setState((prev) => ({ ...prev, isConnected: true, error: null }));
      };

      ws.onmessage = (event) => {
        if (connectionIdRef.current !== currentConnectionId) return;
        handleMessage(event);
      };

      ws.onclose = () => {
        // 현재 연결 ID가 최신인지 확인
        if (connectionIdRef.current !== currentConnectionId) {
          return;
        }
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isReady: false,
        }));
        wsRef.current = null;
      };

      ws.onerror = () => {
        if (connectionIdRef.current !== currentConnectionId) return;
        setState((prev) => ({
          ...prev,
          error: "WebSocket connection failed. Check if server is running.",
        }));
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WebSocket] ❌ Failed to create WebSocket:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Connection failed",
      }));
    }
  }, [getWebSocketUrl, handleMessage]);

  /**
   * WebSocket 연결 해제
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        // 연결 종료 알림 전송 (선택 사항)
        try {
          wsRef.current.send(JSON.stringify({ type: "disconnect" }));
        } catch (e) {
          // ignore
        }
      }
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  /**
   * 텍스트 메시지 전송
   */
  const sendText = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = { type: "text", text };
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  /**
   * 오디오 청크 전송 (Base64 PCM16)
   */
  const sendAudioChunk = useCallback((audioData: Float32Array, sampleRate: number = 16000) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const pcm16 = float32ToPCM16(audioData);
      const base64 = bytesToBase64(pcm16);
      const message = {
        type: "input_audio_buffer.append", // 변경된 사양 적용
        audio: base64,
        sample_rate: sampleRate,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  /**
   * AI 메시지 초기화
   */
  const clearAiMessage = useCallback(() => {
    setState((prev) => ({ ...prev, aiMessage: "", userTranscript: "" }));
  }, []);

  /**
   * 세션 설정 업데이트 (음성, 지시사항 변경)
   */
  const updateSession = useCallback((config: { voice?: string; instructions?: string }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: "session.update",
        config,
      };
      wsRef.current.send(JSON.stringify(message));
      console.log("[WebSocket] Session update sent:", config);
    } else {
      console.warn("[WebSocket] Cannot update session: not connected");
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    connect,
    disconnect,
    sendText,
    sendAudioChunk,
    clearAiMessage,
    updateSession, // 세션 설정 업데이트 함수 노출
    initAudio, // 오디오 초기화(Unlock) 함수 노출
  };
}
