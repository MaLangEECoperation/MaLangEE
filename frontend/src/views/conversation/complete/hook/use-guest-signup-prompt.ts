import { useState, useEffect, useCallback, useRef } from "react";

import { COMPLETE_TIMER } from "../config";

interface UseGuestSignupPromptOptions {
  /** 인증 여부 */
  isAuthenticated: boolean;
  /** 인증 로딩 중 여부 */
  isAuthLoading: boolean;
  /** 프롬프트 표시까지 지연 시간 (ms, default: 1500) */
  delayMs?: number;
}

interface UseGuestSignupPromptReturn {
  /** 회원가입 프롬프트 표시 여부 */
  showPrompt: boolean;
  /** 프롬프트 닫기 */
  dismiss: () => void;
}

/**
 * 비로그인 사용자에게 회원가입을 권유하는 프롬프트를 관리하는 훅
 *
 * @param options - 옵션
 * @returns { showPrompt, dismiss }
 *
 * @example
 * ```tsx
 * const { showPrompt, dismiss } = useGuestSignupPrompt({
 *   isAuthenticated: !!user,
 *   isAuthLoading,
 * });
 *
 * <SignupPromptDialog open={showPrompt} onClose={dismiss} />
 * ```
 */
export function useGuestSignupPrompt(
  options: UseGuestSignupPromptOptions
): UseGuestSignupPromptReturn {
  const {
    isAuthenticated,
    isAuthLoading,
    delayMs = COMPLETE_TIMER.SIGNUP_PROMPT_DELAY_MS,
  } = options;
  const [showPrompt, setShowPrompt] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setShowPrompt(false);
  }, [clearTimer]);

  useEffect(() => {
    clearTimer();

    // 인증된 사용자이거나 로딩 중이면 프롬프트 표시 안 함
    if (isAuthenticated || isAuthLoading) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setShowPrompt(true);
    }, delayMs);

    return clearTimer;
  }, [isAuthenticated, isAuthLoading, delayMs, clearTimer]);

  return { showPrompt, dismiss };
}
