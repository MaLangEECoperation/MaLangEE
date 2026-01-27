import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioPlayerReturn {
  /** 재생 중인지 여부 */
  isPlaying: boolean;
  /** 오디오 재생 */
  play: (url: string) => void;
  /** 오디오 중지 */
  stop: () => void;
}

/**
 * 오디오 재생을 제어하는 훅 (cleanup 포함)
 *
 * @returns { isPlaying, play, stop }
 *
 * @example
 * ```tsx
 * const { isPlaying, play, stop } = useAudioPlayer();
 *
 * <button onClick={() => play('/audio/sample.mp3')}>재생</button>
 * <button onClick={stop}>중지</button>
 * ```
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(
    (url: string) => {
      // 기존 재생 중지
      stop();

      const audio = new Audio(url);
      audioRef.current = audio;

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });

      // 재생 완료 시 상태 업데이트
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
    },
    [stop]
  );

  // unmount 시 cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { isPlaying, play, stop };
}
