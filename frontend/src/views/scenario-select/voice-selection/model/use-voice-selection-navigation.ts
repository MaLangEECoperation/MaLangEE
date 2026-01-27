import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface UseVoiceSelectionNavigationOptions {
  /** 선택된 음성 ID */
  voiceId: string;
  /** 세션 ID */
  sessionId: string | null;
  /** 샘플 재생 중지 함수 */
  stopSample: () => void;
  /** localStorage 키 */
  storageKey: string;
  /** 대화 페이지 경로 */
  chatRoute: string;
}

/**
 * 음성 선택 후 대화 페이지로 이동하는 훅
 *
 * @param options - 음성, 세션, 라우트 정보
 * @returns navigate 함수
 *
 * @example
 * ```tsx
 * const handleConfirm = useVoiceSelectionNavigation({
 *   voiceId: selectedVoice,
 *   sessionId: sessionId,
 *   stopSample: stopPreview,
 *   storageKey: STORAGE_KEYS.SELECTED_VOICE,
 *   chatRoute: "/conversation/chat",
 * });
 *
 * <Button onClick={handleConfirm}>선택 완료</Button>
 * ```
 */
export function useVoiceSelectionNavigation(
  options: UseVoiceSelectionNavigationOptions
): () => void {
  const { voiceId, sessionId, stopSample, storageKey, chatRoute } = options;
  const router = useRouter();

  return useCallback(() => {
    // 샘플 재생 중지
    if (typeof stopSample === "function") {
      stopSample();
    }

    // 음성 저장
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, voiceId);
    }

    // 대화 페이지로 이동
    const url = sessionId ? `${chatRoute}?sessionId=${sessionId}` : chatRoute;
    router.push(url);
  }, [voiceId, sessionId, stopSample, storageKey, chatRoute, router]);
}
