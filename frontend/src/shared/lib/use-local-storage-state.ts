import { useState, useCallback } from "react";

/**
 * localStorage와 동기화되는 상태를 관리하는 훅
 *
 * @param key - localStorage 키
 * @param defaultValue - localStorage에 값이 없을 때 사용할 기본값
 * @returns [value, setValue] 튜플
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorageState('theme', 'light');
 * ```
 */
export function useLocalStorageState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR 안전성: window 존재 여부 확인
    if (typeof window === "undefined") {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);

      // SSR 안전성: window 존재 여부 확인
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // localStorage 오류 무시 (예: 용량 초과)
        }
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
