"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { ConversationState, Message, VoiceSettings, WebSocketEvent } from "../model/types";
import { DEFAULT_VOICE_SETTINGS } from "../model/types";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export interface UseWebSocketConversationOptions {
  situation?: string;
  voiceSettings?: VoiceSettings;
  onMessage?: (message: Message) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onAudioData?: (audioData: ArrayBuffer) => void;
  onStateChange?: (state: ConversationState) => void;
  onError?: (error: Error) => void;
}

export interface UseWebSocketConversationReturn {
  isConnected: boolean;
  conversationState: ConversationState;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudio: (audioData: Float32Array) => void;
  sendTextMessage: (text: string) => void;
  error: Error | null;
}

export const useWebSocketConversation = (
  options: UseWebSocketConversationOptions = {}
): UseWebSocketConversationReturn => {
  const {
    situation = "",
    voiceSettings = DEFAULT_VOICE_SETTINGS,
    onMessage,
    onTranscript,
    onAudioData,
    onStateChange,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 상태 변경 핸들러
  const updateState = useCallback(
    (newState: ConversationState) => {
      setConversationState(newState);
      onStateChange?.(newState);
    },
    [onStateChange]
  );

  // WebSocket 연결
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/ws/chat?situation=${encodeURIComponent(situation)}&voice=${voiceSettings.voice}`;
      const ws = new WebSocket(wsUrl);

      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        updateState("idle");
      };

      ws.onmessage = (event) => {
        // 바이너리 데이터 (오디오)
        if (event.data instanceof ArrayBuffer) {
          onAudioData?.(event.data);
          return;
        }

        // JSON 데이터
        try {
          const data: WebSocketEvent = JSON.parse(event.data);

          switch (data.type) {
            case "audio.delta":
              // Base64 오디오 데이터를 ArrayBuffer로 변환
              const binaryString = atob(data.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              onAudioData?.(bytes.buffer);
              updateState("speaking");
              break;

            case "audio.done":
              updateState("idle");
              break;

            case "transcript.delta":
              onTranscript?.(data.content, false);
              updateState("processing");
              break;

            case "transcript.done":
              onTranscript?.(data.content, true);
              if (onMessage) {
                const message: Message = {
                  id: crypto.randomUUID(),
                  role: "assistant",
                  content: data.content,
                  timestamp: new Date(),
                };
                onMessage(message);
              }
              break;

            case "error":
              const err = new Error(data.message);
              setError(err);
              onError?.(err);
              break;
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = () => {
        const err = new Error("WebSocket 연결 오류가 발생했습니다.");
        setError(err);
        onError?.(err);
      };

      ws.onclose = () => {
        setIsConnected(false);
        updateState("idle");

        // 자동 재연결 (5초 후)
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            // 재연결은 사용자가 명시적으로 요청할 때만
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("WebSocket 연결에 실패했습니다.");
      setError(error);
      onError?.(error);
    }
  }, [situation, voiceSettings.voice, onAudioData, onTranscript, onMessage, onError, updateState]);

  // WebSocket 연결 해제
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    updateState("idle");
  }, [updateState]);

  // 오디오 데이터 전송
  const sendAudio = useCallback(
    (audioData: Float32Array) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }

      // Float32Array를 Int16 PCM으로 변환
      const int16Array = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        const s = Math.max(-1, Math.min(1, audioData[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      wsRef.current.send(int16Array.buffer);
      updateState("listening");
    },
    [updateState]
  );

  // 텍스트 메시지 전송
  const sendTextMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }

      const message = JSON.stringify({
        type: "text",
        content: text,
      });

      wsRef.current.send(message);
      updateState("processing");

      // 사용자 메시지 콜백
      if (onMessage) {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          timestamp: new Date(),
        };
        onMessage(userMessage);
      }
    },
    [onMessage, updateState]
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    conversationState,
    connect,
    disconnect,
    sendAudio,
    sendTextMessage,
    error,
  };
};
