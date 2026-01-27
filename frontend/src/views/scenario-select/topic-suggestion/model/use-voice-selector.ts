import { useState, useCallback, useMemo } from "react";

interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

interface UseVoiceSelectorOptions<T extends VoiceOption> {
  /** 음성 옵션 목록 */
  voiceOptions: T[];
  /** 초기 인덱스 */
  initialIndex?: number;
}

interface UseVoiceSelectorReturn<T extends VoiceOption> {
  /** 현재 인덱스 */
  currentIndex: number;
  /** 현재 선택된 음성 */
  currentVoice: T;
  /** 이전 음성으로 이동 */
  handlePrev: () => void;
  /** 다음 음성으로 이동 */
  handleNext: () => void;
}

/**
 * 음성 캐러셀 선택을 관리하는 훅
 *
 * @param options - 음성 옵션과 초기 인덱스
 * @returns { currentIndex, currentVoice, handlePrev, handleNext }
 *
 * @example
 * ```tsx
 * const { currentVoice, handlePrev, handleNext } = useVoiceSelector({
 *   voiceOptions: voices,
 *   initialIndex: 0,
 * });
 *
 * <VoiceCarousel
 *   voice={currentVoice}
 *   onPrev={handlePrev}
 *   onNext={handleNext}
 * />
 * ```
 */
export function useVoiceSelector<T extends VoiceOption>(
  options: UseVoiceSelectorOptions<T>
): UseVoiceSelectorReturn<T> {
  const { voiceOptions, initialIndex = 0 } = options;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentVoice = useMemo(() => {
    return voiceOptions[currentIndex];
  }, [voiceOptions, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return voiceOptions.length - 1;
      }
      return prev - 1;
    });
  }, [voiceOptions.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === voiceOptions.length - 1) {
        return 0;
      }
      return prev + 1;
    });
  }, [voiceOptions.length]);

  return {
    currentIndex,
    currentVoice,
    handlePrev,
    handleNext,
  };
}
