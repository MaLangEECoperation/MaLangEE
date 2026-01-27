import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { useConversationSettings } from "./use-conversation-settings";

describe("useConversationSettings", () => {
  const VOICE_KEY = "test-voice";
  const SUBTITLE_KEY = "test-subtitle";

  beforeEach(() => {
    localStorage.clear();
  });

  it("localStorage에 저장된 음성과 자막 설정을 로드한다", () => {
    localStorage.setItem(VOICE_KEY, "echo");
    localStorage.setItem(SUBTITLE_KEY, "false");

    const { result } = renderHook(() =>
      useConversationSettings({
        voiceStorageKey: VOICE_KEY,
        subtitleStorageKey: SUBTITLE_KEY,
      })
    );

    expect(result.current.selectedVoice).toBe("echo");
    expect(result.current.showSubtitle).toBe(false);
  });

  it("localStorage에 값이 없으면 기본값을 사용한다", () => {
    const { result } = renderHook(() =>
      useConversationSettings({
        voiceStorageKey: VOICE_KEY,
        subtitleStorageKey: SUBTITLE_KEY,
        defaultVoice: "alloy",
        defaultSubtitle: true,
      })
    );

    expect(result.current.selectedVoice).toBe("alloy");
    expect(result.current.showSubtitle).toBe(true);
  });

  it("setSelectedVoice 호출 시 상태와 localStorage를 업데이트한다", () => {
    const { result } = renderHook(() =>
      useConversationSettings({
        voiceStorageKey: VOICE_KEY,
        subtitleStorageKey: SUBTITLE_KEY,
      })
    );

    act(() => {
      result.current.setSelectedVoice("nova");
    });

    expect(result.current.selectedVoice).toBe("nova");
    expect(localStorage.getItem(VOICE_KEY)).toBe("nova");
  });

  it("setShowSubtitle 호출 시 상태와 localStorage를 업데이트한다", () => {
    const { result } = renderHook(() =>
      useConversationSettings({
        voiceStorageKey: VOICE_KEY,
        subtitleStorageKey: SUBTITLE_KEY,
      })
    );

    act(() => {
      result.current.setShowSubtitle(false);
    });

    expect(result.current.showSubtitle).toBe(false);
    expect(localStorage.getItem(SUBTITLE_KEY)).toBe("false");
  });
});
