"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth";
import { useConversationChatNew } from "@/features/chat/hook/useConversationChatNew";
import { useReadHints } from "@/features/chat/query";
import { LanguageNotRecognizedDialog, RealtimeHint } from "@/features/chat/ui";
import { STORAGE_KEYS } from "@/shared/config";
import { debugLog, debugError } from "@/shared/lib";
import {
  Button,
  ChatMicButton,
  MalangEE,
  MalangEEStatus,
  ConfirmPopup,
  Dialog,
  SettingsPopup,
  SettingsTrigger,
  DebugStatus,
} from "@/shared/ui";

import { defaultConversationContents } from "../config";
import type { ConversationPageContents } from "../model";

const HINT_DELAY_MS = 15000; // 15초 후 힌트 프롬프트 표시
const WAIT_POPUP_DELAY_MS = 5000; // 힌트 표시 후 5초 더 대기하면 종료 모달

export interface ConversationPageProps {
  contents?: ConversationPageContents;
}

interface ConversationContentProps {
  contents: ConversationPageContents;
}

export function ConversationPage({
  contents = defaultConversationContents,
}: ConversationPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <MalangEE status="default" size={150} />
        </div>
      }
    >
      <ConversationContent contents={contents} />
    </Suspense>
  );
}

function ConversationContent({ contents }: ConversationContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: _user } = useAuth();

  // sessionId 상태
  const [sessionId, setSessionId] = useState<string>("");

  // 팝업 상태
  const [showSessionErrorPopup, setShowSessionErrorPopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const voiceBeforeSettingsRef = useRef("");
  const [showWaitPopup, setShowWaitPopup] = useState(false);
  const [showLoginPopup, _setShowLoginPopup] = useState(false);
  const [showLanguageErrorPopup, setShowLanguageErrorPopup] = useState(false);

  // sessionId 초기화
  useEffect(() => {
    if (sessionId) return;

    const urlSessionId = searchParams.get("sessionId");
    const storedSessionId = localStorage.getItem(STORAGE_KEYS.CHAT_SESSION_ID);

    if (urlSessionId) {
      debugLog("[SessionId] Using URL sessionId:", urlSessionId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionId(urlSessionId);
      localStorage.setItem(STORAGE_KEYS.CHAT_SESSION_ID, urlSessionId);
    } else if (storedSessionId) {
      debugLog("[SessionId] Using stored sessionId:", storedSessionId);

      setSessionId(storedSessionId);
      router.replace(`/chat?sessionId=${storedSessionId}`, { scroll: false });
    } else {
      debugError("[SessionId] No sessionId found");
      setShowSessionErrorPopup(true);
    }
  }, [sessionId, searchParams, router]);

  // 설정 상태
  const [selectedVoice, setSelectedVoice] = useState("shimmer");
  const [showSubtitle, setShowSubtitle] = useState(true);

  // 연결 성공 여부 추적 (ref 대신 state로 변경하여 렌더링 중 안전하게 접근)
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    const voice = localStorage.getItem(STORAGE_KEYS.SELECTED_VOICE);
    const subtitle = localStorage.getItem(STORAGE_KEYS.SUBTITLE_ENABLED);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (voice !== null) setSelectedVoice(voice);

    if (subtitle !== null) setShowSubtitle(subtitle === "true");
  }, []);

  const {
    state,
    connect,
    disconnect,
    initAudio,
    requestResponse,
    startMicrophone,
    stopMicrophone,
    toggleMute: _toggleMute,
    updateVoice,
  } = useConversationChatNew(sessionId, selectedVoice);

  const disconnectRef = useRef(disconnect);
  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);

  useEffect(() => {
    if (state.isConnected && !wasConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWasConnected(true);
    }
  }, [state.isConnected, wasConnected]);

  // 힌트 관련 상태
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showHintText, setShowHintText] = useState(false);
  const [shouldFetchHint, setShouldFetchHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: hintsData, isLoading: isHintsLoading } = useReadHints(
    shouldFetchHint ? sessionId : null
  );
  const hints = hintsData?.hints;

  // 마이크 상태
  const [isMuted, _setIsMuted] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);

  // 타이머 정리 함수
  const clearHintTimer = useCallback(() => {
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  }, []);

  const clearWaitPopupTimer = useCallback(() => {
    if (waitPopupTimerRef.current) {
      clearTimeout(waitPopupTimerRef.current);
      waitPopupTimerRef.current = null;
    }
  }, []);

  const resetHintState = useCallback(() => {
    clearHintTimer();
    clearWaitPopupTimer();
    setShowHintPrompt(false);
    setShowHintText(false);
    setShouldFetchHint(false);
    setShowWaitPopup(false);
  }, [clearHintTimer, clearWaitPopupTimer]);

  // 15초 타이머
  useEffect(() => {
    clearHintTimer();
    if (!state.lastAiAudioDoneAt || state.isAiSpeaking) return;
    if (state.isUserSpeaking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetHintState();
      return;
    }

    const elapsedTime = Date.now() - state.lastAiAudioDoneAt;
    const remainingTime = Math.max(0, HINT_DELAY_MS - elapsedTime);

    hintTimerRef.current = setTimeout(() => {
      setShowHintPrompt(true);
    }, remainingTime);

    return clearHintTimer;
  }, [
    state.lastAiAudioDoneAt,
    state.isAiSpeaking,
    state.isUserSpeaking,
    clearHintTimer,
    resetHintState,
  ]);

  // 5초 추가 대기 후 종료 모달
  useEffect(() => {
    clearWaitPopupTimer();
    if (!showHintPrompt || state.isUserSpeaking) return;

    waitPopupTimerRef.current = setTimeout(() => {
      setShowWaitPopup(true);
    }, WAIT_POPUP_DELAY_MS);

    return clearWaitPopupTimer;
  }, [showHintPrompt, state.isUserSpeaking, clearWaitPopupTimer]);

  useEffect(() => {
    return () => {
      clearHintTimer();
      clearWaitPopupTimer();
    };
  }, [clearHintTimer, clearWaitPopupTimer]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // [unintelligible] 감지 시 언어 인식 실패 팝업 표시
  useEffect(() => {
    if (state.userTranscript?.toLowerCase().includes("[unintelligible]")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowLanguageErrorPopup(true);
    }
  }, [state.userTranscript]);

  // 자동 연결
  useEffect(() => {
    if (!isMounted || !sessionId || sessionId.trim() === "") return;

    initAudio();
    connect();

    return () => {
      disconnectRef.current();
    };
  }, [isMounted, sessionId, initAudio, connect]);

  // 마이크 시작
  useEffect(() => {
    if (!state.isConnected || !state.isReady || isMicEnabled) return;

    const startMic = async () => {
      try {
        setIsMicEnabled(true);
        await startMicrophone();
        setTimeout(() => requestResponse(), 500);
      } catch (error) {
        debugError("[StartMic] Failed:", error);
        setIsMicEnabled(false);
        alert(contents.errors.microphoneError);
      }
    };

    startMic();
  }, [state.isConnected, state.isReady, isMicEnabled, startMicrophone, requestResponse]);

  // 마이크 상태 관리
  useEffect(() => {
    if (!state.isConnected || !state.isReady) {
      if (isMicEnabled) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMicEnabled(false);
        stopMicrophone();
      }
    }
  }, [state.isConnected, state.isReady, isMicEnabled, stopMicrophone]);

  // MalangEE 상태
  const getMalangEEStatus = (): MalangEEStatus => {
    if (state.userTranscript?.toLowerCase().includes("[unintelligible]")) return "sad";
    if (showHintPrompt) return "humm";
    if (state.isAiSpeaking) return "talking";
    return "default";
  };

  // 메시지 상태
  const messageStates = [
    {
      condition: () => !state.isConnected && wasConnected,
      title: contents.messages.connectionError.title,
      desc: contents.messages.connectionError.description,
    },
    {
      condition: () => state.userTranscript?.toLowerCase().includes("[unintelligible]"),
      title: contents.messages.unintelligible.title,
      desc: contents.messages.unintelligible.description,
    },
    {
      condition: () => showHintPrompt && !state.isUserSpeaking && !state.isAiSpeaking,
      title: contents.messages.waitingForAnswer.title,
      desc: contents.messages.waitingForAnswer.description,
    },
    {
      condition: () => state.isAiSpeaking,
      title: state.aiMessage || contents.messages.aiSpeaking.defaultTitle,
      desc: showSubtitle ? state.aiMessageKR || "" : "",
    },
    {
      condition: () => state.isConnected && state.isReady && !state.isAiSpeaking,
      title: state.aiMessage || contents.messages.listening.defaultTitle,
      desc:
        showSubtitle && state.aiMessageKR
          ? state.aiMessageKR
          : contents.messages.listening.defaultDescription,
    },
    {
      condition: () => !state.isConnected && !wasConnected,
      title: contents.messages.connecting.title,
      desc: contents.messages.connecting.description,
    },
    {
      condition: () => true,
      title: contents.messages.preparing.title,
      desc: "",
    },
  ];

  const getCurrentMessage = () =>
    messageStates.find((s) => s.condition()) || messageStates[messageStates.length - 1];
  const getMainTitle = () => getCurrentMessage().title;
  const getSubDesc = () => getCurrentMessage().desc;

  // 핸들러
  const handleHintClick = useCallback(() => {
    setShouldFetchHint(true);
    setShowHintText(true);
  }, []);

  // 언어 인식 실패 팝업 핸들러
  const handleLanguageErrorRetry = useCallback(() => {
    setShowLanguageErrorPopup(false);
    // 마이크는 이미 활성화 상태이므로 팝업만 닫기
  }, []);

  const handleLanguageErrorSwitchToText = useCallback(() => {
    setShowLanguageErrorPopup(false);
    // TODO: Phase 7에서 텍스트 입력 모드 구현
    alert(contents.errors.textInputNotReady);
  }, [contents.errors.textInputNotReady]);

  const handleLanguageErrorClose = useCallback(() => {
    setShowLanguageErrorPopup(false);
  }, []);

  const handleStopFromWait = async () => {
    setShowWaitPopup(false);
    await disconnect();
    router.push("/chat/complete");
  };

  const handleContinueChat = () => {
    clearWaitPopupTimer();
    setShowWaitPopup(false);
  };

  const handleSubtitleChange = (enabled: boolean) => {
    setShowSubtitle(enabled);
    localStorage.setItem(STORAGE_KEYS.SUBTITLE_ENABLED, enabled.toString());
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE, voiceId);
  };

  return (
    <>
      <DebugStatus
        isConnected={state.isConnected}
        isReady={state.isReady}
        lastEvent={state.logs.length > 0 ? state.logs[state.logs.length - 1] : null}
        isAiSpeaking={state.isAiSpeaking}
        isRecording={state.isRecording}
        userTranscript={state.userTranscript}
      />

      {/* Character */}
      <div className="character-box relative">
        <MalangEE status={getMalangEEStatus()} size={150} />
      </div>

      {/* 실시간 힌트 */}
      <RealtimeHint
        hints={hints || []}
        isLoading={isHintsLoading}
        showPrompt={showHintPrompt && !state.isUserSpeaking && !state.isAiSpeaking}
        showHintText={showHintText}
        onRequestHint={handleHintClick}
      />

      {/* 메시지 및 마이크 */}
      <div className="flex w-full flex-col items-center transition-all duration-300">
        <div className="relative flex min-h-[120px] w-full flex-col items-center justify-center">
          <div className="text-group text-center">
            <h1 className="scenario-title whitespace-pre-line">{getMainTitle()}</h1>
            <p className="scenario-desc">{getSubDesc()}</p>
          </div>
        </div>

        <ChatMicButton
          state={state}
          isMuted={isMuted}
          isListening={isMicEnabled || state.isRecording}
          hasStarted={true}
        />
      </div>

      {/* 설정 변경하기 버튼 */}
      <div className="mt-6">
        <SettingsTrigger
          onClick={() => {
            voiceBeforeSettingsRef.current = selectedVoice;
            setShowSettingsPopup(true);
          }}
        />
      </div>

      {/* 설정 팝업 */}
      <SettingsPopup
        isOpen={showSettingsPopup}
        onClose={() => {
          setShowSettingsPopup(false);
          if (selectedVoice !== voiceBeforeSettingsRef.current) {
            updateVoice(selectedVoice);
          }
        }}
        showSubtitle={showSubtitle}
        onSubtitleChange={handleSubtitleChange}
        selectedVoice={selectedVoice}
        onVoiceChange={handleVoiceChange}
      />

      {/* Login Popup */}
      {showLoginPopup && (
        <ConfirmPopup
          message={
            <p className="whitespace-pre-line text-xl font-semibold leading-relaxed text-gray-800">
              {contents.loginPrompt.message}
            </p>
          }
          confirmText={contents.loginPrompt.confirmText}
          cancelText={contents.loginPrompt.cancelText}
          onConfirm={() => router.push("/auth/login")}
          onCancel={() => router.push("/auth/signup")}
        />
      )}

      {/* Wait Popup - 대화 그만하기 → /chat/complete */}
      {showWaitPopup && (
        <ConfirmPopup
          message={
            <p className="whitespace-pre-line text-xl font-semibold leading-relaxed text-gray-800">
              {contents.waitPopup.message}
            </p>
          }
          confirmText={contents.waitPopup.confirmText}
          cancelText={contents.waitPopup.cancelText}
          onConfirm={handleContinueChat}
          onCancel={handleStopFromWait}
          disableBackdropClick
        />
      )}

      {/* 언어 인식 실패 팝업 */}
      <LanguageNotRecognizedDialog
        isOpen={showLanguageErrorPopup}
        onRetry={handleLanguageErrorRetry}
        onSwitchToText={handleLanguageErrorSwitchToText}
        onClose={handleLanguageErrorClose}
      />

      {/* SessionId 에러 팝업 */}
      {showSessionErrorPopup && (
        <Dialog onClose={() => {}} showCloseButton={false} maxWidth="sm">
          <div className="flex flex-col items-center gap-6 py-2">
            <MalangEE status="humm" size={120} />
            <div className="text-xl font-bold text-[#1F1C2B]">{contents.sessionError.title}</div>
            <p className="text-center text-sm text-gray-600">{contents.sessionError.description}</p>
            <div className="flex w-full gap-3">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => router.push("/scenario-select")}
              >
                {contents.sessionError.buttonText}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
