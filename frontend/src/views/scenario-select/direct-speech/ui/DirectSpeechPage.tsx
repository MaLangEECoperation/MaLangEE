"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useScenarioChatNew } from "@/features/chat";
import {
  MalangEE,
  ChatMicButton,
  ScenarioResultPopup,
  DebugStatus,
  STORAGE_KEYS,
  useInactivityTimer,
} from "@/shared";
import "@/shared/styles/scenario.css";

import { defaultDirectSpeechContents } from "../config";
import type { DirectSpeechPageContents } from "../model";

export interface DirectSpeechPageProps {
  contents?: DirectSpeechPageContents;
}

export function DirectSpeechPage({
  contents = defaultDirectSpeechContents,
}: DirectSpeechPageProps) {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [textOpacity, setTextOpacity] = useState(1);
  const [showNotUnderstood, setShowNotUnderstood] = useState(false);
  const [showScenarioResultPopup, setShowScenarioResultPopup] = useState(false);
  const [wasConnected, setWasConnected] = useState(false);

  const {
    showInactivityMessage,
    startInactivityTimer,
    resetTimers: resetInactivityTimers,
  } = useInactivityTimer();

  const notUnderstoodTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPromptSentRef = useRef(false);
  const prevAiSpeakingRef = useRef(false);

  const {
    state: chatState,
    connect,
    disconnect,
    sendText,
    startMicrophone,
    stopMicrophone,
    initAudio,
    startScenarioSession,
  } = useScenarioChatNew();

  const hintMessage = contents.hintMessage;

  const clearNotUnderstoodTimer = () => {
    if (notUnderstoodTimerRef.current) {
      clearTimeout(notUnderstoodTimerRef.current);
      notUnderstoodTimerRef.current = null;
    }
  };

  // 연결 성공 여부 추적
  useEffect(() => {
    if (chatState.isConnected && !wasConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWasConnected(true);
    }
  }, [chatState.isConnected, wasConnected]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      clearNotUnderstoodTimer();
      disconnect();
    };
  }, [disconnect]);

  // 페이지 진입 시 자동 연결
  useEffect(() => {
    if (!hasStarted && !chatState.isConnected) {
      initAudio();
      connect();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasStarted(true);
    }
  }, [hasStarted, chatState.isConnected, initAudio, connect]);

  // 연결 준비 완료 시 시나리오 세션 시작
  useEffect(() => {
    if (chatState.isReady && !initialPromptSentRef.current) {
      startScenarioSession();
      initialPromptSentRef.current = true;
    }
  }, [chatState.isReady, startScenarioSession]);

  // pendingTopic 처리 (주제 선택 후 이동한 경우)
  useEffect(() => {
    if (chatState.isReady) {
      const pendingTopic = sessionStorage.getItem("pendingTopic");
      if (pendingTopic) {
        sessionStorage.removeItem("pendingTopic");
        sendText(pendingTopic);
      }
    }
  }, [chatState.isReady, sendText]);

  // AI 발화/녹음 상태에 따른 마이크 제어
  useEffect(() => {
    if (chatState.isAiSpeaking && chatState.isRecording) {
      stopMicrophone();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsListening(false);
    }

    if (
      prevAiSpeakingRef.current &&
      !chatState.isAiSpeaking &&
      chatState.isReady &&
      initialPromptSentRef.current &&
      !chatState.isRecording
    ) {
      startMicrophone();

      setIsListening(true);
    }

    prevAiSpeakingRef.current = chatState.isAiSpeaking;
  }, [
    chatState.isAiSpeaking,
    chatState.isReady,
    chatState.isRecording,
    startMicrophone,
    stopMicrophone,
  ]);

  const resetTimers = useCallback(() => {
    resetInactivityTimers();
    setShowNotUnderstood(false);
  }, [resetInactivityTimers]);

  // 비활성 타이머 관리
  useEffect(() => {
    if (!hasStarted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetTimers();
      return;
    }

    if (chatState.isAiSpeaking || chatState.isRecording) {
      resetTimers();
      return;
    }

    startInactivityTimer();
  }, [
    chatState.isAiSpeaking,
    chatState.isRecording,
    hasStarted,
    startInactivityTimer,
    resetTimers,
  ]);

  // 시나리오 결과 처리
  useEffect(() => {
    if (chatState.scenarioResult) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetTimers();

      setIsListening(false);
      stopMicrophone();

      if (typeof window !== "undefined") {
        const { conversationGoal, conversationPartner, place, sessionId } =
          chatState.scenarioResult;
        if (conversationGoal)
          localStorage.setItem(STORAGE_KEYS.CONVERSATION_GOAL, conversationGoal);
        if (conversationPartner)
          localStorage.setItem(STORAGE_KEYS.CONVERSATION_PARTNER, conversationPartner);
        if (place) localStorage.setItem(STORAGE_KEYS.PLACE, place);
        if (sessionId) localStorage.setItem(STORAGE_KEYS.CHAT_SESSION_ID, sessionId);

        setShowScenarioResultPopup(true);
      }
    }
  }, [chatState.scenarioResult, stopMicrophone, resetTimers, router]);

  // 팝업 표시 시 타이머 리셋
  useEffect(() => {
    if (showScenarioResultPopup) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetTimers();
    }
  }, [showScenarioResultPopup, resetTimers]);

  // AI 메시지 수신 시 타이머 초기화
  useEffect(() => {
    if (!chatState.aiMessage) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowNotUnderstood(false);
    clearNotUnderstoodTimer();
  }, [chatState.aiMessage]);

  // 사용자 발화 감지 시 타이머 관리
  useEffect(() => {
    if (!chatState.userTranscript) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowNotUnderstood(false);
    clearNotUnderstoodTimer();
    notUnderstoodTimerRef.current = setTimeout(() => {
      if (!chatState.isAiSpeaking) {
        setShowNotUnderstood(true);
      }
    }, 5000);
  }, [chatState.userTranscript, chatState.isAiSpeaking]);

  const handleMicClick = () => {
    initAudio();
    resetTimers();
    setTextOpacity(0);
    setTimeout(() => {
      if (!chatState.isConnected) {
        connect();
        setHasStarted(true);
      } else if (isListening) {
        stopMicrophone();
        setIsListening(false);
      } else {
        startMicrophone();
        setIsListening(true);
      }
      setTextOpacity(1);
    }, 300);
  };

  // 상황별 메시지 정의
  const getMessageState = () => {
    if (hasStarted && !chatState.isConnected && wasConnected) {
      return {
        title: contents.messages.connectionError.title,
        desc: contents.messages.connectionError.description,
      };
    }
    if (showInactivityMessage) {
      return {
        title: contents.messages.inactivity.title,
        desc: contents.messages.inactivity.description,
      };
    }
    if (showNotUnderstood) {
      return {
        title: contents.messages.notUnderstood.title,
        desc: contents.messages.notUnderstood.description,
      };
    }
    if (chatState.isAiSpeaking) {
      return {
        title: chatState.aiMessage || contents.messages.aiSpeaking.defaultTitle,
        desc: chatState.aiMessageKR || contents.messages.aiSpeaking.defaultDescription,
      };
    }
    if (isListening && hasStarted) {
      return {
        title: chatState.aiMessage || contents.messages.listening.defaultTitle,
        desc: chatState.aiMessageKR || contents.messages.listening.defaultDescription,
      };
    }
    if (hasStarted && !chatState.isConnected && !wasConnected) {
      return {
        title: contents.messages.connecting.title,
        desc: contents.messages.connecting.description,
      };
    }
    return {
      title: contents.messages.preparing.title,
      desc: contents.messages.preparing.description,
    };
  };

  const currentMessage = getMessageState();

  return (
    <>
      <DebugStatus
        isConnected={chatState.isConnected}
        isReady={chatState.isReady}
        lastEvent={chatState.logs.length > 0 ? chatState.logs[chatState.logs.length - 1] : null}
        isAiSpeaking={chatState.isAiSpeaking}
        isRecording={chatState.isRecording}
        userTranscript={chatState.userTranscript}
      />

      <div className="character-box relative flex justify-center">
        <MalangEE status={showInactivityMessage ? "humm" : "default"} size={120} />
        {showInactivityMessage && (
          <div className="animate-in fade-in slide-in-from-top-2 absolute top-[105px] z-50 flex flex-col items-center drop-shadow-sm filter duration-300">
            {/* 꼬리: 본체 테두리를 덮기 위해 z-10 및 relative 배치 */}
            <div className="relative top-[7px] z-10 h-3 w-3 rotate-45 border-l border-t border-gray-200 bg-white"></div>
            {/* 본체 */}
            <div className="relative rounded-2xl border border-gray-200 bg-white px-5 py-2.5">
              <p className="whitespace-nowrap text-sm font-medium text-gray-600">{hintMessage}</p>
            </div>
          </div>
        )}
      </div>

      <div id="direct-speech" className="flex w-full flex-col items-center">
        <div className="flex w-full flex-col items-center gap-6">
          <div className="flex w-full flex-col items-center transition-all duration-300">
            <div className="relative flex min-h-[120px] w-full flex-col items-center justify-center">
              <div className="text-group text-center" style={{ opacity: textOpacity }}>
                <h1 className="scenario-title whitespace-pre-line">{currentMessage.title}</h1>
                <p className="scenario-desc">{currentMessage.desc}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center gap-4">
              <ChatMicButton
                state={{ ...chatState, isAiSpeaking: chatState.isAiSpeaking }}
                hasStarted={hasStarted}
                isListening={isListening}
                onClick={handleMicClick}
              />
            </div>
          </div>
        </div>
      </div>

      {showScenarioResultPopup && chatState.scenarioResult && (
        <ScenarioResultPopup
          scenarioResult={chatState.scenarioResult}
          onConfirm={() => {
            setShowScenarioResultPopup(false);
            router.push("/scenario-select/subtitle-settings");
          }}
          onCancel={() => {
            setShowScenarioResultPopup(false);
            disconnect();
            router.push("/scenario-select");
          }}
        />
      )}
    </>
  );
}
