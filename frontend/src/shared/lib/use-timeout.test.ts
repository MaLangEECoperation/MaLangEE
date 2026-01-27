import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { useTimeout } from "./use-timeout";

describe("useTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("delay 후 callback을 실행한다", () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("enabled=false 시 타이머가 비활성화된다", () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, 1000, { enabled: false }));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("reset 호출 시 타이머가 재시작된다", () => {
    const callback = vi.fn();

    const { result } = renderHook(() => useTimeout(callback, 1000));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      result.current.reset();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("unmount 시 타이머가 cleanup된다", () => {
    const callback = vi.fn();

    const { unmount } = renderHook(() => useTimeout(callback, 1000));

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
