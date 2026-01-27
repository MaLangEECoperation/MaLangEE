import { useEffect } from "react";

interface User {
  id: string;
  nickname: string;
}

interface UseEntryTypeSyncOptions {
  /** 현재 사용자 */
  currentUser: User | null;
  /** localStorage 키 */
  storageKey: string;
}

/**
 * 사용자 인증 상태에 따라 entryType을 동기화하는 훅
 *
 * @param options - 사용자 정보와 스토리지 키
 *
 * @example
 * ```tsx
 * useEntryTypeSync({
 *   currentUser: user,
 *   storageKey: STORAGE_KEYS.ENTRY_TYPE,
 * });
 * ```
 */
export function useEntryTypeSync(options: UseEntryTypeSyncOptions): void {
  const { currentUser, storageKey } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const entryType = currentUser ? "member" : "guest";
    localStorage.setItem(storageKey, entryType);
  }, [currentUser, storageKey]);
}
