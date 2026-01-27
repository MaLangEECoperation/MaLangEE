import { useEffect } from "react";

interface UseMuteOnMountOptions {
  /** WebRTC mute 함수 */
  mute: () => void;
  /** 오디오 활성화 상태 설정 */
  setAudioEnabled: (enabled: boolean) => void;
}

/**
 * 컴포넌트 마운트 시 오디오를 음소거하는 훅
 *
 * @param options - mute 함수와 setAudioEnabled 함수
 *
 * @example
 * ```tsx
 * useMuteOnMount({
 *   mute: rtcMute,
 *   setAudioEnabled: setIsAudioEnabled,
 * });
 * ```
 */
export function useMuteOnMount(options: UseMuteOnMountOptions): void {
  const { mute, setAudioEnabled } = options;

  useEffect(() => {
    if (typeof mute === "function") {
      mute();
    }
    if (typeof setAudioEnabled === "function") {
      setAudioEnabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
