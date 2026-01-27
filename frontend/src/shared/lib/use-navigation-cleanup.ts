import { useCallback } from "react";

interface UseNavigationCleanupOptions {
  /** 제거할 localStorage/sessionStorage 키 목록 */
  storageKeys: string[];
  /** 추가 cleanup 함수 */
  onCleanup?: () => void;
}

interface UseNavigationCleanupReturn {
  /** Link onClick에 전달할 핸들러 */
  handleClick: (event?: React.MouseEvent) => void;
}

/**
 * 네비게이션 전 cleanup 작업을 수행하는 훅
 *
 * @param options - cleanup 옵션
 * @returns { handleClick }
 *
 * @example
 * ```tsx
 * const { handleClick } = useNavigationCleanup({
 *   storageKeys: [STORAGE_KEYS.CHAT_SESSION_ID, "chatReport"],
 *   onCleanup: () => resetState(),
 * });
 *
 * <Button asChild>
 *   <Link href="/dashboard" onClick={handleClick}>
 *     홈으로
 *   </Link>
 * </Button>
 * ```
 */
export function useNavigationCleanup(
  options: UseNavigationCleanupOptions
): UseNavigationCleanupReturn {
  const { storageKeys, onCleanup } = options;

  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_event?: React.MouseEvent) => {
      // Storage 키 제거
      if (typeof window !== "undefined") {
        storageKeys.forEach((key) => {
          localStorage.removeItem(key);
        });
      }

      // 커스텀 cleanup 실행
      if (onCleanup) {
        onCleanup();
      }
    },
    [storageKeys, onCleanup]
  );

  return { handleClick };
}
