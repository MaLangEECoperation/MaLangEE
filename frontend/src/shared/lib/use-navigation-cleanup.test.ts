import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useNavigationCleanup } from "./use-navigation-cleanup";

const mockRemoveItem = vi.fn();

vi.stubGlobal("localStorage", {
  removeItem: mockRemoveItem,
  getItem: vi.fn(),
  setItem: vi.fn(),
});

describe("useNavigationCleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handleClick 호출 시 지정된 storage 키들을 제거한다", () => {
    const { result } = renderHook(() =>
      useNavigationCleanup({
        storageKeys: ["key1", "key2", "key3"],
      })
    );

    result.current.handleClick();

    expect(mockRemoveItem).toHaveBeenCalledTimes(3);
    expect(mockRemoveItem).toHaveBeenCalledWith("key1");
    expect(mockRemoveItem).toHaveBeenCalledWith("key2");
    expect(mockRemoveItem).toHaveBeenCalledWith("key3");
  });

  it("커스텀 cleanup 함수를 실행한다", () => {
    const customCleanup = vi.fn();

    const { result } = renderHook(() =>
      useNavigationCleanup({
        storageKeys: [],
        onCleanup: customCleanup,
      })
    );

    result.current.handleClick();

    expect(customCleanup).toHaveBeenCalledTimes(1);
  });

  it("storage 키 제거 후 커스텀 cleanup이 실행된다", () => {
    const callOrder: string[] = [];
    const customCleanup = vi.fn(() => callOrder.push("custom"));
    mockRemoveItem.mockImplementation(() => callOrder.push("remove"));

    const { result } = renderHook(() =>
      useNavigationCleanup({
        storageKeys: ["key1"],
        onCleanup: customCleanup,
      })
    );

    result.current.handleClick();

    expect(callOrder).toEqual(["remove", "custom"]);
  });

  it("storageKeys가 비어있어도 오류 없이 동작한다", () => {
    const { result } = renderHook(() =>
      useNavigationCleanup({
        storageKeys: [],
      })
    );

    expect(() => result.current.handleClick()).not.toThrow();
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it("MouseEvent를 전달받아도 정상 동작한다", () => {
    const { result } = renderHook(() =>
      useNavigationCleanup({
        storageKeys: ["key1"],
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent;

    // Link의 onClick으로 사용될 때 이벤트가 전달됨
    result.current.handleClick(mockEvent);

    expect(mockRemoveItem).toHaveBeenCalledWith("key1");
    // preventDefault는 호출하지 않음 (Link 기본 동작 유지)
    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });
});
