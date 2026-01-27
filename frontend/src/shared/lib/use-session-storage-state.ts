import { useState, useCallback } from "react";

/**
 * sessionStorage와 동기화되는 상태를 관리하는 훅
 *
 * @param key - sessionStorage 키
 * @param defaultValue - sessionStorage에 값이 없을 때 사용할 기본값
 * @returns [value, setValue] 튜플
 *
 * @example
 * ```tsx
 * const [sessionId, setSessionId] = useSessionStorageState('sessionId', '');
 * ```
 */
export function useSessionStorageState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const item = sessionStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch {
          // sessionStorage 오류 무시
        }
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
