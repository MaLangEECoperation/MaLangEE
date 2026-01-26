import { useState, useEffect, useRef, useCallback } from "react";

import { CHAT_TIMER } from "@/features/chat";

interface UseHintTimerOptions {
  /** 힌트 표시까지 대기 시간 (ms, default: 15000) */
  hintDelayMs?: number;
  /** 힌트 표시 후 종료 팝업까지 추가 대기 시간 (ms, default: 5000) */
  waitPopupDelayMs?: number;
  /** AI가 말하는 중인지 여부 */
  isAiSpeaking: boolean;
  /** 사용자가 말하는 중인지 여부 */
  isUserSpeaking: boolean;
  /** AI 오디오 재생 완료 시간 (timestamp) */
  lastAiAudioDoneAt: number | null;
}

interface UseHintTimerReturn {
  /** 힌트 프롬프트 표시 여부 */
  showHintPrompt: boolean;
  /** 종료 대기 팝업 표시 여부 */
  showWaitPopup: boolean;
  /** 힌트 상태 초기화 */
  resetHintState: () => void;
}

/**
 * 힌트 타이머를 관리하는 훅
 *
 * AI 응답 후 일정 시간이 지나면 힌트를 표시하고,
 * 추가로 대기하면 종료 팝업을 표시합니다.
 *
 * @param options - 힌트 타이머 옵션
 * @returns { showHintPrompt, showWaitPopup, resetHintState }
 *
 * @example
 * ```tsx
 * const { showHintPrompt, showWaitPopup, resetHintState } = useHintTimer({
 *   isAiSpeaking: state.isAiSpeaking,
 *   isUserSpeaking: state.isUserSpeaking,
 *   lastAiAudioDoneAt: state.lastAiAudioDoneAt,
 * });
 * ```
 */
export function useHintTimer(options: UseHintTimerOptions): UseHintTimerReturn {
  const {
    hintDelayMs = CHAT_TIMER.HINT_DELAY_MS,
    waitPopupDelayMs = CHAT_TIMER.WAIT_POPUP_DELAY_MS,
    isAiSpeaking,
    isUserSpeaking,
    lastAiAudioDoneAt,
  } = options;

  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showWaitPopup, setShowWaitPopup] = useState(false);

  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitPopupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setShowWaitPopup(false);
  }, [clearHintTimer, clearWaitPopupTimer]);

  // 사용자가 말하면 힌트 상태 리셋
  useEffect(() => {
    if (isUserSpeaking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 사용자 발화 시작 시 힌트 리셋은 의도된 동작
      resetHintState();
    }
  }, [isUserSpeaking, resetHintState]);

  // 힌트 타이머 (AI 응답 후 지정된 시간이 지나면 힌트 표시)
  useEffect(() => {
    clearHintTimer();

    if (!lastAiAudioDoneAt || isAiSpeaking || isUserSpeaking) return;

    const elapsedTime = Date.now() - lastAiAudioDoneAt;
    const remainingTime = Math.max(0, hintDelayMs - elapsedTime);

    hintTimerRef.current = setTimeout(() => {
      setShowHintPrompt(true);
    }, remainingTime);

    return clearHintTimer;
  }, [lastAiAudioDoneAt, isAiSpeaking, isUserSpeaking, hintDelayMs, clearHintTimer]);

  // 종료 팝업 타이머 (힌트 표시 후 추가 대기)
  useEffect(() => {
    clearWaitPopupTimer();

    if (!showHintPrompt || isUserSpeaking) return;

    waitPopupTimerRef.current = setTimeout(() => {
      setShowWaitPopup(true);
    }, waitPopupDelayMs);

    return clearWaitPopupTimer;
  }, [showHintPrompt, isUserSpeaking, waitPopupDelayMs, clearWaitPopupTimer]);

  // cleanup
  useEffect(() => {
    return () => {
      clearHintTimer();
      clearWaitPopupTimer();
    };
  }, [clearHintTimer, clearWaitPopupTimer]);

  return { showHintPrompt, showWaitPopup, resetHintState };
}
