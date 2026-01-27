import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useVoiceSelector } from "./use-voice-selector";

describe("useVoiceSelector", () => {
  const mockVoiceOptions = [
    { id: "shimmer", name: "Shimmer", description: "부드러운 목소리" },
    { id: "echo", name: "Echo", description: "또렷한 목소리" },
    { id: "alloy", name: "Alloy", description: "따뜻한 목소리" },
  ];

  it("초기 인덱스로 시작한다", () => {
    const { result } = renderHook(() =>
      useVoiceSelector({
        voiceOptions: mockVoiceOptions,
        initialIndex: 1,
      })
    );

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentVoice.id).toBe("echo");
  });

  it("기본 초기 인덱스는 0이다", () => {
    const { result } = renderHook(() =>
      useVoiceSelector({
        voiceOptions: mockVoiceOptions,
      })
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentVoice.id).toBe("shimmer");
  });

  it("handleNext로 다음 음성을 선택한다", () => {
    const { result } = renderHook(() =>
      useVoiceSelector({
        voiceOptions: mockVoiceOptions,
        initialIndex: 0,
      })
    );

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentVoice.id).toBe("echo");
  });

  it("handlePrev로 이전 음성을 선택한다", () => {
    const { result } = renderHook(() =>
      useVoiceSelector({
        voiceOptions: mockVoiceOptions,
        initialIndex: 1,
      })
    );

    act(() => {
      result.current.handlePrev();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentVoice.id).toBe("shimmer");
  });

  it("마지막에서 다음으로 가면 처음으로 순환한다", () => {
    const { result } = renderHook(() =>
      useVoiceSelector({
        voiceOptions: mockVoiceOptions,
        initialIndex: 2,
      })
    );

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.currentVoice.id).toBe("shimmer");
  });

  it("처음에서 이전으로 가면 마지막으로 순환한다", () => {
    const { result } = renderHook(() =>
      useVoiceSelector({
        voiceOptions: mockVoiceOptions,
        initialIndex: 0,
      })
    );

    act(() => {
      result.current.handlePrev();
    });

    expect(result.current.currentIndex).toBe(2);
    expect(result.current.currentVoice.id).toBe("alloy");
  });
});
