import { useState, useEffect, useRef, useCallback } from "react";

import { DIRECT_SPEECH_TIMER } from "../config";

interface UseNotUnderstoodTimerOptions {
  /** 사용자 발화 텍스트 */
  userTranscript: string | null;
  /** AI가 말하는 중인지 여부 */
  isAiSpeaking: boolean;
  /** 타이머 지연 시간 (ms, default: 5000) */
  delayMs?: number;
}

interface UseNotUnderstoodTimerReturn {
  /** "이해하지 못했습니다" 메시지 표시 여부 */
  showNotUnderstood: boolean;
  /** 타이머 및 상태 초기화 */
  clear: () => void;
}

/**
 * 사용자 발화가 없을 때 "이해하지 못했습니다" 메시지를 표시하는 타이머 훅
 *
 * @param options - 옵션
 * @returns { showNotUnderstood, clear }
 *
 * @example
 * ```tsx
 * const { showNotUnderstood, clear } = useNotUnderstoodTimer({
 *   userTranscript: state.userTranscript,
 *   isAiSpeaking: state.isAiSpeaking,
 * });
 *
 * {showNotUnderstood && <NotUnderstoodMessage onDismiss={clear} />}
 * ```
 */
export function useNotUnderstoodTimer(
  options: UseNotUnderstoodTimerOptions
): UseNotUnderstoodTimerReturn {
  const {
    userTranscript,
    isAiSpeaking,
    delayMs = DIRECT_SPEECH_TIMER.NOT_UNDERSTOOD_DELAY_MS,
  } = options;
  const [showNotUnderstood, setShowNotUnderstood] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clear = useCallback(() => {
    clearTimer();
    setShowNotUnderstood(false);
  }, [clearTimer]);

  useEffect(() => {
    clearTimer();

    // 사용자 발화가 있거나 AI가 말하는 중이면 타이머 시작 안 함
    if (userTranscript || isAiSpeaking) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setShowNotUnderstood(true);
    }, delayMs);

    return clearTimer;
  }, [userTranscript, isAiSpeaking, delayMs, clearTimer]);

  // cleanup on unmount
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return { showNotUnderstood, clear };
}
