import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";

import { useInfiniteScroll } from "./use-infinite-scroll";

// IntersectionObserver 모킹
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

let observerCallback: IntersectionObserverCallback;

class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = "";
  thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }

  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
  takeRecords = (): IntersectionObserverEntry[] => [];
}

describe("useInfiniteScroll", () => {
  beforeAll(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  beforeEach(() => {
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("ref를 반환하고 IntersectionObserver를 설정한다", () => {
    const fetchNextPage = vi.fn();

    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchNextPage,
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull(); // 초기에는 null
  });

  it("요소가 화면에 보이면 fetchNextPage를 호출한다", () => {
    const fetchNextPage = vi.fn();

    const { result } = renderHook(() =>
      useInfiniteScroll({
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchNextPage,
      })
    );

    // ref에 요소 연결 시뮬레이션
    const element = document.createElement("div");
    Object.defineProperty(result.current, "current", {
      value: element,
      writable: true,
    });

    // IntersectionObserver 콜백 트리거
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("hasNextPage가 false면 fetchNextPage를 호출하지 않는다", () => {
    const fetchNextPage = vi.fn();

    renderHook(() =>
      useInfiniteScroll({
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage,
      })
    );

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("isFetchingNextPage가 true면 fetchNextPage를 호출하지 않는다", () => {
    const fetchNextPage = vi.fn();

    renderHook(() =>
      useInfiniteScroll({
        hasNextPage: true,
        isFetchingNextPage: true,
        fetchNextPage,
      })
    );

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("unmount 시 observer가 disconnect된다", () => {
    const fetchNextPage = vi.fn();

    const { unmount } = renderHook(() =>
      useInfiniteScroll({
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchNextPage,
      })
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
