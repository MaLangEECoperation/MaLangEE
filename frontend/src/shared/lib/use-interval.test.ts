import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { useInterval } from "./use-interval";

describe("useInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("지정된 간격으로 callback을 반복 실행한다", () => {
    const callback = vi.fn();

    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("delay가 null이면 인터벌이 중지된다", () => {
    const callback = vi.fn();

    renderHook(() => useInterval(callback, null));

    vi.advanceTimersByTime(5000);

    expect(callback).not.toHaveBeenCalled();
  });

  it("delay 변경 시 인터벌이 재시작된다", () => {
    const callback = vi.fn();

    const { rerender } = renderHook(({ delay }) => useInterval(callback, delay), {
      initialProps: { delay: 1000 as number | null },
    });

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    // delay를 500으로 변경
    rerender({ delay: 500 });

    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("unmount 시 인터벌이 cleanup된다", () => {
    const callback = vi.fn();

    const { unmount } = renderHook(() => useInterval(callback, 1000));

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();

    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1); // 더 이상 호출되지 않음
  });
});
