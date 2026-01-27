import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";

import { useVoicePreview } from "./use-voice-preview";

// Audio 모킹
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockPause = vi.fn();

class MockAudio {
  src = "";
  currentTime = 0;
  play = mockPlay;
  pause = mockPause;
  onended: (() => void) | null = null;
}

describe("useVoicePreview", () => {
  const voiceOptions = [
    { id: "shimmer", name: "Shimmer", sampleUrl: "/audio/shimmer.mp3" },
    { id: "echo", name: "Echo", sampleUrl: "/audio/echo.mp3" },
    { id: "nova", name: "Nova", sampleUrl: "/audio/nova.mp3" },
  ];

  beforeAll(() => {
    vi.stubGlobal("Audio", MockAudio);
  });

  beforeEach(() => {
    mockPlay.mockClear();
    mockPause.mockClear();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("초기 currentIndex는 0이다", () => {
    const { result } = renderHook(() => useVoicePreview({ voiceOptions }));

    expect(result.current.currentIndex).toBe(0);
  });

  it("handleNext 호출 시 인덱스가 증가한다", () => {
    const { result } = renderHook(() => useVoicePreview({ voiceOptions }));

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it("handlePrev 호출 시 인덱스가 감소한다", () => {
    const { result } = renderHook(() => useVoicePreview({ voiceOptions }));

    act(() => {
      result.current.handleNext(); // index 1
      result.current.handlePrev(); // index 0
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("마지막 인덱스에서 handleNext 호출 시 0으로 돌아간다", () => {
    const { result } = renderHook(() => useVoicePreview({ voiceOptions }));

    act(() => {
      result.current.handleNext(); // 1
      result.current.handleNext(); // 2
      result.current.handleNext(); // 0 (wrap)
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it("첫 인덱스에서 handlePrev 호출 시 마지막으로 돌아간다", () => {
    const { result } = renderHook(() => useVoicePreview({ voiceOptions }));

    act(() => {
      result.current.handlePrev(); // wrap to 2
    });

    expect(result.current.currentIndex).toBe(2);
  });
});
