import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { debugLog, debugError } from "@/shared";

interface UseSessionIdOptions {
  /** localStorage 키 */
  storageKey: string;
  /** URL 파라미터명 (default: "sessionId") */
  urlParam?: string;
  /** 에러 발생 시 콜백 */
  onError?: () => void;
}

interface UseSessionIdReturn {
  /** 현재 세션 ID */
  sessionId: string;
  /** 초기화 완료 여부 */
  isInitialized: boolean;
  /** 에러 발생 여부 */
  hasError: boolean;
}

/**
 * 세션 ID를 URL과 localStorage에서 관리하는 훅
 *
 * 우선순위:
 * 1. URL의 sessionId 파라미터
 * 2. localStorage에 저장된 값
 * 3. 둘 다 없으면 에러
 *
 * @param options - 세션 ID 옵션
 * @returns { sessionId, isInitialized, hasError }
 *
 * @example
 * ```tsx
 * const { sessionId, hasError } = useSessionId({
 *   storageKey: STORAGE_KEYS.CHAT_SESSION_ID,
 *   onError: () => setShowErrorPopup(true),
 * });
 * ```
 */
export function useSessionId(options: UseSessionIdOptions): UseSessionIdReturn {
  const { storageKey, urlParam = "sessionId", onError } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const onErrorRef = useRef(onError);

  const [state, setState] = useState<{
    sessionId: string;
    isInitialized: boolean;
    hasError: boolean;
  }>({
    sessionId: "",
    isInitialized: false,
    hasError: false,
  });

  // 최신 onError 유지
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    // 이미 초기화되었으면 스킵
    if (state.isInitialized) {
      return;
    }

    const urlSessionId = searchParams.get(urlParam);
    const storedSessionId = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;

    if (urlSessionId) {
      debugLog("[SessionId] Using URL sessionId:", urlSessionId);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, urlSessionId);
      }
      setState({ sessionId: urlSessionId, isInitialized: true, hasError: false });
    } else if (storedSessionId) {
      debugLog("[SessionId] Using stored sessionId:", storedSessionId);
      router.replace(`?${urlParam}=${storedSessionId}`, { scroll: false });
      setState({ sessionId: storedSessionId, isInitialized: true, hasError: false });
    } else {
      debugError("[SessionId] No sessionId found");
      setState({ sessionId: "", isInitialized: true, hasError: true });
      onErrorRef.current?.();
    }
  }, [state.isInitialized, searchParams, router, storageKey, urlParam]);

  return state;
}
