import { useEffect } from "react";

/**
 * 마운트 시 이전 세션 관련 localStorage 키들을 제거하는 훅
 *
 * 새로운 대화를 시작할 때 이전 세션 데이터를 정리하는 데 사용합니다.
 *
 * @param keys - 제거할 localStorage 키 배열
 *
 * @example
 * ```tsx
 * useClearPreviousSession([
 *   STORAGE_KEYS.CHAT_SESSION_ID,
 *   STORAGE_KEYS.LAST_CONVERSATION,
 * ]);
 * ```
 */
export function useClearPreviousSession(keys: string[]): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
