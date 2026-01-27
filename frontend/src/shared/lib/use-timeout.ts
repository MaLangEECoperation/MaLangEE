import { useEffect, useRef, useCallback, useState } from "react";

interface UseTimeoutOptions {
  /** 타이머 활성화 여부 (default: true) */
  enabled?: boolean;
}

interface UseTimeoutReturn {
  /** 타이머가 트리거되었는지 여부 */
  isTriggered: boolean;
  /** 타이머 재시작 */
  reset: () => void;
  /** 타이머 취소 */
  clear: () => void;
}

/**
 * 타임아웃을 관리하는 훅 (자동 cleanup 포함)
 *
 * @param callback - 타임아웃 후 실행할 콜백
 * @param delay - 지연 시간 (ms)
 * @param options - 옵션 (enabled)
 * @returns { isTriggered, reset, clear }
 *
 * @example
 * ```tsx
 * const { reset } = useTimeout(() => setShowHint(true), 15000, { enabled: isIdle });
 * ```
 */
export function useTimeout(
  callback: () => void,
  delay: number,
  options: UseTimeoutOptions = {}
): UseTimeoutReturn {
  const { enabled = true } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const [isTriggered, setIsTriggered] = useState(false);

  // 최신 callback 유지
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    setIsTriggered(false);

    if (enabled) {
      timeoutRef.current = setTimeout(() => {
        setIsTriggered(true);
        callbackRef.current();
      }, delay);
    }
  }, [clear, delay, enabled]);

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    setIsTriggered(false);
    timeoutRef.current = setTimeout(() => {
      setIsTriggered(true);
      callbackRef.current();
    }, delay);

    return clear;
  }, [delay, enabled, clear]);

  return {
    isTriggered,
    reset,
    clear,
  };
}
