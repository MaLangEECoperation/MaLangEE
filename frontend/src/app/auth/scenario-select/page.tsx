"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MicButton, Button } from "@/shared/ui";
import { PopupLayout } from "@/shared/ui/PopupLayout";
import "@/shared/styles/scenario.css";
import { FullLayout } from "@/shared/ui/FullLayout";
import { useMicrophoneCapture, useAudioPlayback } from "@/features/voice-recording";
import { useScenarioWebSocket } from "@/features/scenario-chat";
import type { ServerMessage, ScenarioJson } from "@/features/scenario-chat/model/types";

/**
 * 시나리오 선택 페이지 상태
 * 0: 초기 상태 (대기)
 * 1: 음성 인식 중 (듣는 중)
 * 2: 인식 실패 (에러)
 * 3: 인식 성공 및 분석 중 (성공)
 */
type ScenarioState = 0 | 1 | 2 | 3;

export default function ScenarioSelectPage() {
  const router = useRouter();
  const [currentState, setCurrentState] = useState<ScenarioState>(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showInactivityMessage, setShowInactivityMessage] = useState(false);
  const [showWaitPopup, setShowWaitPopup] = useState(false);
  const [showEndChatPopup, setShowEndChatPopup] = useState(false);
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [aiTranscript, setAiTranscript] = useState<string>("");
  const [scenarioData, setScenarioData] = useState<ScenarioJson | null>(null);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waitTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 콜백을 ref로 저장하여 최신 상태 유지
  const timerCallbacksRef = useRef<{
    startInactivityTimer: () => void;
    resetTimers: () => void;
  } | null>(null);

  // 오디오 재생 훅
  const { addAudioChunk, isPlaying, clearQueue } = useAudioPlayback({
    sampleRate: 24000,
  });

  // 비활동 타이머 정리
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // 응답 대기 타이머 정리
  const clearWaitTimer = useCallback(() => {
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current);
      waitTimerRef.current = null;
    }
  }, []);

  // 응답 대기 타이머 시작 (5초 후 팝업 표시)
  const startWaitTimer = useCallback(() => {
    clearWaitTimer();
    waitTimerRef.current = setTimeout(() => {
      setShowWaitPopup(true);
    }, 5000);
  }, [clearWaitTimer]);

  // 사용자 활동 시작 (타이머 초기화)
  const resetTimers = useCallback(() => {
    clearInactivityTimer();
    clearWaitTimer();
    setShowInactivityMessage(false);
  }, [clearInactivityTimer, clearWaitTimer]);

  // 비활동 타이머 시작 (15초 후 메시지 표시)
  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      setShowInactivityMessage(true);
      // 비활동 메시지 표시 후 5초 뒤 응답 대기 팝업
      startWaitTimer();
    }, 15000);
  }, [clearInactivityTimer, startWaitTimer]);

  // 타이머 콜백 ref 업데이트
  useEffect(() => {
    timerCallbacksRef.current = {
      startInactivityTimer,
      resetTimers,
    };
  }, [startInactivityTimer, resetTimers]);

  // 서버 메시지 처리 핸들러
  const handleServerMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case "ready":
        // WebSocket 연결 준비 완료
        console.log("WebSocket ready");
        break;

      case "response.audio.delta":
        // AI 음성 응답 재생
        addAudioChunk(message.delta);
        break;

      case "response.audio_transcript.delta":
        // AI 응답 텍스트 스트리밍
        setAiTranscript((prev) => prev + message.delta);
        break;

      case "response.audio_transcript.done":
        // AI 응답 완료
        setAiTranscript(message.transcript);
        break;

      case "input_audio.transcript":
        // 사용자 음성 인식 결과
        setUserTranscript(message.transcript);
        // setTimeout으로 다음 tick에서 실행
        setTimeout(() => {
          timerCallbacksRef.current?.resetTimers();
        }, 0);
        break;

      case "scenario.completed":
        // 시나리오 분석 완료
        setScenarioData(message.json);
        setCurrentState(3);

        // 성공 시 1.5초 후 로그인 팝업 표시
        setTimeout(() => {
          setShowLoginPopup(true);
        }, 1500);

        // 비활동 타이머 시작
        setTimeout(() => {
          timerCallbacksRef.current?.startInactivityTimer();
        }, 0);
        break;

      case "error":
        // 에러 발생
        console.error("WebSocket error:", message.message);
        setCurrentState(2);
        break;
    }
  }, [addAudioChunk]);

  // 시나리오 완료 콜백
  const handleScenarioComplete = useCallback((scenario: ScenarioJson) => {
    console.log("Scenario completed:", scenario);
    setScenarioData(scenario);
  }, []);

  // WebSocket 훅
  const {
    connectionState,
    error: wsError,
    connect,
    disconnect,
    sendAudioChunk,
  } = useScenarioWebSocket({
    isGuest: true, // 게스트 모드로 연결
    onMessage: handleServerMessage,
    onScenarioComplete: handleScenarioComplete,
  });

  // 마이크 캡처 훅
  const {
    isRecording,
    permissionStatus,
    error: micError,
    startRecording,
    stopRecording,
  } = useMicrophoneCapture({
    sampleRate: 16000,
    channelCount: 1,
    chunkDurationMs: 100,
    onAudioChunk: (chunk) => {
      // WebSocket으로 오디오 청크 전송
      if (connectionState === "connected") {
        sendAudioChunk(chunk.data);
      }
    },
  });

  // 컴포넌트 마운트 시 WebSocket 연결
  useEffect(() => {
    connect();
    return () => {
      disconnect();
      clearQueue();
    };
  }, [connect, disconnect, clearQueue]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearInactivityTimer();
      clearWaitTimer();
    };
  }, [clearInactivityTimer, clearWaitTimer]);

  // 마이크 버튼 클릭 핸들러
  const handleMicClick = useCallback(async () => {
    if (currentState === 3) return;
    if (connectionState !== "connected") return;

    // 사용자 활동 - 타이머 리셋
    resetTimers();

    // Fade out text
    setTextOpacity(0);

    setTimeout(async () => {
      if (isRecording) {
        // 녹음 중지
        stopRecording();
        setCurrentState(0);
      } else {
        // 녹음 시작
        // 재생 중이면 중지
        if (isPlaying) {
          clearQueue();
        }

        try {
          await startRecording();
          setCurrentState(1);
          setUserTranscript("");
          setAiTranscript("");
        } catch (err) {
          console.error("Failed to start recording:", err);
          setCurrentState(2);
        }
      }
      // Fade in text
      setTextOpacity(1);
    }, 300);
  }, [currentState, connectionState, isRecording, isPlaying, stopRecording, startRecording, clearQueue, resetTimers]);

  const getMainTitle = () => {
    if (showInactivityMessage) {
      return "말랭이가 대답을 기다리고 있어요.";
    }

    switch (currentState) {
      case 0:
        return "어떤 상황을 연습하고 싶은지\n편하게 말해보세요.";
      case 1:
        return "장소나 상황 또는 키워드로\n말씀해 주세요.";
      case 2:
        return "말랭이가 잘 이해하지 못했어요.";
      case 3:
        return "좋아요! 상황을 파악했어요.\n잠시만 기다려주세요.";
      default:
        return "";
    }
  };

  const getSubDesc = () => {
    if (showInactivityMessage) {
      return "Cheer up!";
    }

    switch (currentState) {
      case 0:
        return "마이크를 누르면 바로 시작돼요";
      case 1:
        return "다 듣고 나면 마이크를 다시 눌러주세요";
      case 2:
        return "다시 한번 말씀해 주시겠어요?";
      case 3:
        return "곧 연습을 시작할게요!";
      default:
        return "";
    }
  };

  const handleStopChat = () => {
    router.push("/auth/signup");
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleContinueChat = () => {
    setShowWaitPopup(false);
    resetTimers();
    startInactivityTimer();
  };

  const handleStopFromWait = () => {
    router.push("/auth/signup");
  };

  const handleContinueFromEnd = () => {
    setShowEndChatPopup(false);
    resetTimers();
    startInactivityTimer();
  };

  const handleStopFromEnd = () => {
    router.push("/auth/signup");
  };

  return (
    <>
      <FullLayout showHeader={true} maxWidth="md:max-w-[60vw]">
        {/* Character */}
        <div className="character-box">
          <Image
            src="/images/malangee.svg"
            alt="MalangEE Character"
            width={150}
            height={150}
            priority
          />
        </div>

        {/* Text Group */}
        <div className="text-group text-center" style={{ opacity: textOpacity }}>
          <h1 className="scenario-title">{getMainTitle()}</h1>
          <p className="scenario-desc">{getSubDesc()}</p>
        </div>

        {/* 연결 상태 표시 */}
        {connectionState !== "connected" && (
          <div className="mb-4 text-center">
            <span className="text-sm text-text-secondary">
              {connectionState === "connecting" && "서버 연결 중..."}
              {connectionState === "reconnecting" && "재연결 중..."}
              {connectionState === "error" && "연결 오류"}
              {connectionState === "disconnected" && "연결 끊김"}
            </span>
          </div>
        )}

        {/* 에러 표시 */}
        {(wsError || micError) && (
          <div className="mb-4 text-center">
            <span className="text-sm text-red-500">{wsError || micError}</span>
          </div>
        )}

        {/* 마이크 권한 거부 표시 */}
        {permissionStatus === "denied" && (
          <div className="mb-4 text-center">
            <span className="text-sm text-red-500">마이크 권한이 필요합니다</span>
          </div>
        )}

        {/* 사용자 음성 인식 결과 */}
        {userTranscript && (
          <div className="mb-4 rounded-xl bg-brand/10 px-4 py-2 text-center">
            <span className="text-sm text-text-primary">{userTranscript}</span>
          </div>
        )}

        {/* AI 응답 텍스트 */}
        {aiTranscript && (
          <div className="mb-4 rounded-xl bg-gray-100 px-4 py-2 text-center">
            <span className="text-sm text-text-primary">{aiTranscript}</span>
          </div>
        )}

        {/* 재생 중 표시 */}
        {isPlaying && (
          <div className="mb-4 text-center">
            <span className="text-sm text-text-secondary">
              <span className="animate-pulse">🔊</span> AI 음성 재생 중...
            </span>
          </div>
        )}

        {/* Mic Button - Footer */}
        <div className="mt-6">
          <MicButton
            isListening={isRecording}
            onClick={handleMicClick}
            isMuted={connectionState !== "connected" || currentState === 3 || permissionStatus === "denied"}
            size="md"
          />
        </div>

        {/* 시나리오 데이터 표시 (디버그용) */}
        {scenarioData && (
          <div className="mt-4 rounded-xl bg-green-50 p-4 text-left text-sm">
            <p className="font-semibold text-green-700">시나리오 분석 완료:</p>
            <p>장소: {scenarioData.place}</p>
            <p>대화 상대: {scenarioData.conversation_partner}</p>
            <p>대화 목표: {scenarioData.conversation_goal}</p>
          </div>
        )}

      </FullLayout>

      {/* Login Popup */}
      {showLoginPopup && (
        <PopupLayout onClose={() => setShowLoginPopup(false)} maxWidth="md" showCloseButton={false}>
          <div className="flex flex-col items-center gap-6 py-6">
            {/* Text */}
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                로그인을 하면 대화를 저장하고
                <br />
                이어 말할 수 있어요
              </p>
            </div>

            {/* Buttons - 한 행에 2개 */}
            <div className="flex w-full gap-3">
              <Button
                onClick={handleStopChat}
                variant="outline"
                className="h-14 flex-1 rounded-full border-2 border-gray-300 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                대화 그만하기
              </Button>
              <Button
                variant="primary"
                size="xl"
                onClick={handleLogin}
                className="flex-1"
              >
                로그인하기
              </Button>
            </div>
          </div>
        </PopupLayout>
      )}

      {/* Wait Popup - 응답 대기 팝업 */}
      {showWaitPopup && (
        <PopupLayout onClose={() => setShowWaitPopup(false)} maxWidth="md" showCloseButton={false}>
          <div className="flex flex-col items-center gap-6 py-6">
            {/* Text */}
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                대화가 잠시 멈췄어요.
                <br />
                계속 이야기 할까요?
              </p>
            </div>

            {/* Buttons - 한 행에 2개 */}
            <div className="flex w-full gap-3">
              <Button
                onClick={handleStopFromWait}
                variant="outline"
                className="h-14 flex-1 rounded-full border-2 border-gray-300 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                대화 그만하기
              </Button>
              <Button
                variant="primary"
                size="xl"
                onClick={handleContinueChat}
                className="flex-1"
              >
                이어 말하기
              </Button>
            </div>
          </div>
        </PopupLayout>
      )}

      {/* End Chat Popup - 대화 종료 팝업 */}
      {showEndChatPopup && (
        <PopupLayout onClose={() => setShowEndChatPopup(false)} maxWidth="md" showCloseButton={false}>
          <div className="flex flex-col items-center gap-6 py-6">
            {/* Text */}
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800 leading-relaxed">
                지금은 여기까지만 할까요?
                <br />
                나중에 같은 주제로 다시 대화할 수 있어요.
              </p>
            </div>

            {/* Buttons - 한 행에 2개 */}
            <div className="flex w-full gap-3">
              <Button
                onClick={handleStopFromEnd}
                variant="outline"
                className="h-14 flex-1 rounded-full border-2 border-gray-300 text-base font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                대화 그만하기
              </Button>
              <Button
                variant="primary"
                size="xl"
                onClick={handleContinueFromEnd}
                className="flex-1"
              >
                이어 말하기
              </Button>
            </div>
          </div>
        </PopupLayout>
      )}
    </>
  );
}
