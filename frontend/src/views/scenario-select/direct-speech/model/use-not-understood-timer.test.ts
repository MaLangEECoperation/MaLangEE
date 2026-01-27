import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { useNotUnderstoodTimer } from "./use-not-understood-timer";

describe("useNotUnderstoodTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("userTranscript가 null이고 AI가 말하지 않을 때 타이머가 시작된다", () => {
    const { result } = renderHook(() =>
      useNotUnderstoodTimer({
        userTranscript: null,
        isAiSpeaking: false,
        delayMs: 5000,
      })
    );

    expect(result.current.showNotUnderstood).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.showNotUnderstood).toBe(true);
  });

  it("userTranscript가 있으면 타이머가 시작되지 않는다", () => {
    const { result } = renderHook(() =>
      useNotUnderstoodTimer({
        userTranscript: "Hello",
        isAiSpeaking: false,
        delayMs: 5000,
      })
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.showNotUnderstood).toBe(false);
  });

  it("AI가 말하는 중이면 타이머가 시작되지 않는다", () => {
    const { result } = renderHook(() =>
      useNotUnderstoodTimer({
        userTranscript: null,
        isAiSpeaking: true,
        delayMs: 5000,
      })
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.showNotUnderstood).toBe(false);
  });

  it("clear 호출 시 showNotUnderstood가 false가 된다", () => {
    const { result } = renderHook(() =>
      useNotUnderstoodTimer({
        userTranscript: null,
        isAiSpeaking: false,
        delayMs: 5000,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.showNotUnderstood).toBe(true);

    act(() => {
      result.current.clear();
    });

    expect(result.current.showNotUnderstood).toBe(false);
  });
});
