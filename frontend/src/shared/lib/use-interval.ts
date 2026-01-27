import { useEffect, useRef } from "react";

/**
 * 인터벌을 관리하는 훅 (자동 cleanup 포함)
 *
 * @param callback - 인터벌마다 실행할 콜백
 * @param delay - 인터벌 간격 (ms), null이면 중지
 *
 * @example
 * ```tsx
 * // 1초마다 실행
 * useInterval(() => setCount(c => c + 1), 1000);
 *
 * // 조건부 중지
 * useInterval(tick, isRunning ? 1000 : null);
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  // 최신 callback 유지
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}
