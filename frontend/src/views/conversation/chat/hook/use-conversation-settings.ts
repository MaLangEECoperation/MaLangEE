import { useState, useCallback, useEffect } from "react";

interface UseConversationSettingsOptions {
  /** 음성 설정 localStorage 키 */
  voiceStorageKey: string;
  /** 자막 설정 localStorage 키 */
  subtitleStorageKey: string;
  /** 기본 음성 (default: "shimmer") */
  defaultVoice?: string;
  /** 기본 자막 표시 여부 (default: true) */
  defaultSubtitle?: boolean;
}

interface UseConversationSettingsReturn {
  /** 선택된 음성 */
  selectedVoice: string;
  /** 자막 표시 여부 */
  showSubtitle: boolean;
  /** 음성 설정 변경 */
  setSelectedVoice: (voice: string) => void;
  /** 자막 설정 변경 */
  setShowSubtitle: (enabled: boolean) => void;
}

/**
 * 대화 설정(음성, 자막)을 localStorage와 동기화하여 관리하는 훅
 *
 * @param options - 설정 옵션
 * @returns { selectedVoice, showSubtitle, setSelectedVoice, setShowSubtitle }
 *
 * @example
 * ```tsx
 * const { selectedVoice, showSubtitle, setSelectedVoice } = useConversationSettings({
 *   voiceStorageKey: STORAGE_KEYS.SELECTED_VOICE,
 *   subtitleStorageKey: STORAGE_KEYS.SUBTITLE_ENABLED,
 * });
 * ```
 */
export function useConversationSettings(
  options: UseConversationSettingsOptions
): UseConversationSettingsReturn {
  const {
    voiceStorageKey,
    subtitleStorageKey,
    defaultVoice = "shimmer",
    defaultSubtitle = true,
  } = options;

  const [selectedVoice, setSelectedVoiceState] = useState(defaultVoice);
  const [showSubtitle, setShowSubtitleState] = useState(defaultSubtitle);

  // localStorage에서 초기값 로드
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedVoice = localStorage.getItem(voiceStorageKey);
    const storedSubtitle = localStorage.getItem(subtitleStorageKey);

    if (storedVoice !== null) {
      setSelectedVoiceState(storedVoice);
    }
    if (storedSubtitle !== null) {
      setShowSubtitleState(storedSubtitle === "true");
    }
  }, [voiceStorageKey, subtitleStorageKey]);

  const setSelectedVoice = useCallback(
    (voice: string) => {
      setSelectedVoiceState(voice);
      if (typeof window !== "undefined") {
        localStorage.setItem(voiceStorageKey, voice);
      }
    },
    [voiceStorageKey]
  );

  const setShowSubtitle = useCallback(
    (enabled: boolean) => {
      setShowSubtitleState(enabled);
      if (typeof window !== "undefined") {
        localStorage.setItem(subtitleStorageKey, String(enabled));
      }
    },
    [subtitleStorageKey]
  );

  return {
    selectedVoice,
    showSubtitle,
    setSelectedVoice,
    setShowSubtitle,
  };
}
