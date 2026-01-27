import { useCallback } from "react";

interface TimeFormat {
  /** 시간 단위 (예: "시간", "h") */
  hours: string;
  /** 분 단위 (예: "분", "m") */
  minutes: string;
  /** 초 단위 (예: "초", "s") */
  seconds: string;
}

/**
 * 초 단위 시간을 포맷팅하는 함수를 반환하는 훅
 *
 * @param format - 시간 포맷 (시간/분/초 단위 문자열)
 * @returns 초를 포맷된 문자열로 변환하는 함수
 *
 * @example
 * ```tsx
 * const formatDuration = useFormatDuration({ hours: '시간', minutes: '분', seconds: '초' });
 * formatDuration(3725); // "01시간 02분 05초"
 * ```
 */
export function useFormatDuration(format: TimeFormat): (totalSeconds: number) => string {
  return useCallback(
    (totalSeconds: number): string => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const pad = (n: number): string => n.toString().padStart(2, "0");

      if (hours > 0) {
        return `${pad(hours)}${format.hours} ${pad(minutes)}${format.minutes} ${pad(seconds)}${format.seconds}`;
      }

      return `${pad(minutes)}${format.minutes} ${pad(seconds)}${format.seconds}`;
    },
    [format.hours, format.minutes, format.seconds]
  );
}
