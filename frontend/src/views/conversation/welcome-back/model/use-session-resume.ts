import { useMemo, useCallback } from "react";

interface UseSessionResumeOptions {
  /** 현재 세션 ID */
  sessionId: string | null;
  /** localStorage 키 */
  storageKey: string;
}

interface UseSessionResumeReturn {
  /** 세션 재개 가능 여부 */
  canResume: boolean;
  /** 세션 정보 삭제 */
  clearSession: () => void;
}

/**
 * 세션 재개 가능 여부를 확인하고 관리하는 훅
 *
 * @param options - 옵션
 * @returns { canResume, clearSession }
 *
 * @example
 * ```tsx
 * const { canResume, clearSession } = useSessionResume({
 *   sessionId: storedSessionId,
 *   storageKey: STORAGE_KEYS.CHAT_SESSION_ID,
 * });
 *
 * if (canResume) {
 *   return <ResumeButton onClick={() => router.push('/chat')} />;
 * }
 * ```
 */
export function useSessionResume(options: UseSessionResumeOptions): UseSessionResumeReturn {
  const { sessionId, storageKey } = options;

  const canResume = useMemo(() => {
    return Boolean(sessionId && sessionId.trim() !== "");
  }, [sessionId]);

  const clearSession = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return { canResume, clearSession };
}
