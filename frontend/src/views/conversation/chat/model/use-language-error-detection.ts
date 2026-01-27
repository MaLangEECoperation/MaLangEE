import { useState, useEffect, useCallback } from "react";

interface UseLanguageErrorDetectionOptions {
  /** 사용자 발화 텍스트 */
  userTranscript: string | null;
}

interface UseLanguageErrorDetectionReturn {
  /** 언어 인식 오류 표시 여부 */
  showLanguageError: boolean;
  /** 오류 팝업 닫기 */
  dismissError: () => void;
}

/**
 * 언어 인식 오류를 감지하는 훅
 *
 * [unintelligible] 텍스트가 감지되면 언어 인식 실패로 판단합니다.
 *
 * @param options - 옵션
 * @returns { showLanguageError, dismissError }
 *
 * @example
 * ```tsx
 * const { showLanguageError, dismissError } = useLanguageErrorDetection({
 *   userTranscript: state.userTranscript,
 * });
 *
 * <LanguageNotRecognizedDialog
 *   open={showLanguageError}
 *   onClose={dismissError}
 * />
 * ```
 */
export function useLanguageErrorDetection(
  options: UseLanguageErrorDetectionOptions
): UseLanguageErrorDetectionReturn {
  const { userTranscript } = options;
  const [showLanguageError, setShowLanguageError] = useState(false);

  useEffect(() => {
    if (userTranscript?.toLowerCase().includes("[unintelligible]")) {
      setShowLanguageError(true);
    }
  }, [userTranscript]);

  const dismissError = useCallback(() => {
    setShowLanguageError(false);
  }, []);

  return { showLanguageError, dismissError };
}
