import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { useGuestSignupPrompt } from "./use-guest-signup-prompt";

describe("useGuestSignupPrompt", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("비인증 사용자에게 지연 후 프롬프트를 표시한다", () => {
    const { result } = renderHook(() =>
      useGuestSignupPrompt({
        isAuthenticated: false,
        isAuthLoading: false,
        delayMs: 1500,
      })
    );

    expect(result.current.showPrompt).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.showPrompt).toBe(true);
  });

  it("인증된 사용자에게는 프롬프트를 표시하지 않는다", () => {
    const { result } = renderHook(() =>
      useGuestSignupPrompt({
        isAuthenticated: true,
        isAuthLoading: false,
        delayMs: 1500,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.showPrompt).toBe(false);
  });

  it("인증 로딩 중에는 프롬프트를 표시하지 않는다", () => {
    const { result } = renderHook(() =>
      useGuestSignupPrompt({
        isAuthenticated: false,
        isAuthLoading: true,
        delayMs: 1500,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.showPrompt).toBe(false);
  });

  it("dismiss 호출 시 프롬프트가 숨겨진다", () => {
    const { result } = renderHook(() =>
      useGuestSignupPrompt({
        isAuthenticated: false,
        isAuthLoading: false,
        delayMs: 1500,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.showPrompt).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.showPrompt).toBe(false);
  });
});
