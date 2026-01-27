import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { useTitleRotation } from "./use-title-rotation";

describe("useTitleRotation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("초기 activeIndex는 0이다", () => {
    const items = ["Title 1", "Title 2", "Title 3"];
    const { result } = renderHook(() => useTitleRotation({ items }));

    expect(result.current.activeIndex).toBe(0);
  });

  it("지정된 시간마다 activeIndex가 증가한다", () => {
    const items = ["Title 1", "Title 2", "Title 3"];
    const { result } = renderHook(() => useTitleRotation({ items, intervalMs: 1000 }));

    expect(result.current.activeIndex).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.activeIndex).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.activeIndex).toBe(2);
  });

  it("마지막 인덱스 다음에는 0으로 돌아간다", () => {
    const items = ["Title 1", "Title 2"];
    const { result } = renderHook(() => useTitleRotation({ items, intervalMs: 1000 }));

    act(() => {
      vi.advanceTimersByTime(1000); // index 1
    });

    act(() => {
      vi.advanceTimersByTime(1000); // index 0 (wrap around)
    });

    expect(result.current.activeIndex).toBe(0);
  });

  it("setActiveIndex로 직접 인덱스를 설정할 수 있다", () => {
    const items = ["Title 1", "Title 2", "Title 3"];
    const { result } = renderHook(() => useTitleRotation({ items }));

    act(() => {
      result.current.setActiveIndex(2);
    });

    expect(result.current.activeIndex).toBe(2);
  });
});
