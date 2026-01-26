import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { useHintTimer } from "./use-hint-timer";

describe("useHintTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("AI 응답 후 지정된 시간이 지나면 showHintPrompt가 true가 된다", () => {
    const { result } = renderHook(() =>
      useHintTimer({
        hintDelayMs: 5000,
        waitPopupDelayMs: 3000,
        isAiSpeaking: false,
        isUserSpeaking: false,
        lastAiAudioDoneAt: Date.now(),
      })
    );

    expect(result.current.showHintPrompt).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.showHintPrompt).toBe(true);
  });

  it("힌트 표시 후 추가 대기 시간이 지나면 showWaitPopup이 true가 된다", () => {
    const { result } = renderHook(() =>
      useHintTimer({
        hintDelayMs: 5000,
        waitPopupDelayMs: 3000,
        isAiSpeaking: false,
        isUserSpeaking: false,
        lastAiAudioDoneAt: Date.now(),
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000); // 힌트 표시
    });

    expect(result.current.showHintPrompt).toBe(true);
    expect(result.current.showWaitPopup).toBe(false);

    act(() => {
      vi.advanceTimersByTime(3000); // 추가 대기
    });

    expect(result.current.showWaitPopup).toBe(true);
  });

  it("사용자가 말하면 힌트 상태가 리셋된다", () => {
    const { result, rerender } = renderHook(
      ({ isUserSpeaking }) =>
        useHintTimer({
          hintDelayMs: 5000,
          waitPopupDelayMs: 3000,
          isAiSpeaking: false,
          isUserSpeaking,
          lastAiAudioDoneAt: Date.now(),
        }),
      { initialProps: { isUserSpeaking: false } }
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.showHintPrompt).toBe(true);

    rerender({ isUserSpeaking: true });

    expect(result.current.showHintPrompt).toBe(false);
    expect(result.current.showWaitPopup).toBe(false);
  });

  it("AI가 말하는 중에는 힌트 타이머가 작동하지 않는다", () => {
    const { result } = renderHook(() =>
      useHintTimer({
        hintDelayMs: 5000,
        waitPopupDelayMs: 3000,
        isAiSpeaking: true,
        isUserSpeaking: false,
        lastAiAudioDoneAt: Date.now(),
      })
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.showHintPrompt).toBe(false);
  });

  it("resetHintState 호출 시 모든 상태가 초기화된다", () => {
    const { result } = renderHook(() =>
      useHintTimer({
        hintDelayMs: 5000,
        waitPopupDelayMs: 3000,
        isAiSpeaking: false,
        isUserSpeaking: false,
        lastAiAudioDoneAt: Date.now(),
      })
    );

    // 힌트 표시
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.showHintPrompt).toBe(true);

    // 대기 팝업 표시
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.showWaitPopup).toBe(true);

    act(() => {
      result.current.resetHintState();
    });

    expect(result.current.showHintPrompt).toBe(false);
    expect(result.current.showWaitPopup).toBe(false);
  });
});
