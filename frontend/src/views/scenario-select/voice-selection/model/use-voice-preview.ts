import { useState, useCallback, useRef, useEffect } from "react";

interface VoiceOption {
  id: string;
  name: string;
  sampleUrl: string;
}

interface UseVoicePreviewOptions {
  /** 음성 옵션 배열 */
  voiceOptions: VoiceOption[];
  /** 초기 인덱스 (default: 0) */
  initialIndex?: number;
}

interface UseVoicePreviewReturn {
  /** 현재 선택된 인덱스 */
  currentIndex: number;
  /** 현재 재생 중인지 여부 */
  isPlaying: boolean;
  /** 이전 음성으로 이동 */
  handlePrev: () => void;
  /** 다음 음성으로 이동 */
  handleNext: () => void;
  /** 샘플 재생 */
  playSample: () => void;
  /** 샘플 중지 */
  stopSample: () => void;
}

/**
 * 음성 선택 및 미리듣기를 관리하는 훅
 *
 * @param options - 옵션
 * @returns 음성 선택 및 재생 제어 함수들
 *
 * @example
 * ```tsx
 * const { currentIndex, handleNext, playSample } = useVoicePreview({
 *   voiceOptions,
 * });
 *
 * <button onClick={handleNext}>다음</button>
 * <button onClick={playSample}>미리듣기</button>
 * ```
 */
export function useVoicePreview(options: UseVoicePreviewOptions): UseVoicePreviewReturn {
  const { voiceOptions, initialIndex = 0 } = options;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSample = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handlePrev = useCallback(() => {
    stopSample();
    setCurrentIndex((prev) => (prev === 0 ? voiceOptions.length - 1 : prev - 1));
  }, [voiceOptions.length, stopSample]);

  const handleNext = useCallback(() => {
    stopSample();
    setCurrentIndex((prev) => (prev === voiceOptions.length - 1 ? 0 : prev + 1));
  }, [voiceOptions.length, stopSample]);

  const playSample = useCallback(() => {
    stopSample();

    const currentVoice = voiceOptions[currentIndex];
    if (!currentVoice?.sampleUrl) return;

    const audio = new Audio(currentVoice.sampleUrl);
    audioRef.current = audio;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });

    audio.onended = () => {
      setIsPlaying(false);
      audioRef.current = null;
    };
  }, [currentIndex, voiceOptions, stopSample]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    currentIndex,
    isPlaying,
    handlePrev,
    handleNext,
    playSample,
    stopSample,
  };
}
