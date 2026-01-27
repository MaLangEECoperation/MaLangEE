import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { useLocalStorageState } from "./use-local-storage-state";

describe("useLocalStorageState", () => {
  const TEST_KEY = "test-key";

  beforeEach(() => {
    localStorage.clear();
  });

  it("localStorage에 값이 있으면 초기값으로 로드한다", () => {
    localStorage.setItem(TEST_KEY, JSON.stringify("stored-value"));

    const { result } = renderHook(() => useLocalStorageState(TEST_KEY, "default-value"));

    expect(result.current[0]).toBe("stored-value");
  });

  it("localStorage에 값이 없으면 기본값을 반환한다", () => {
    const { result } = renderHook(() => useLocalStorageState(TEST_KEY, "default-value"));

    expect(result.current[0]).toBe("default-value");
  });

  it("값 변경 시 localStorage를 업데이트한다", () => {
    const { result } = renderHook(() => useLocalStorageState(TEST_KEY, "initial"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(JSON.parse(localStorage.getItem(TEST_KEY)!)).toBe("new-value");
  });

  it("localStorage에서 JSON 파싱 오류 시 기본값을 반환한다", () => {
    // 잘못된 JSON 저장
    localStorage.setItem(TEST_KEY, "invalid-json{");

    const { result } = renderHook(() => useLocalStorageState(TEST_KEY, "default-value"));

    // 파싱 오류 시 기본값 반환
    expect(result.current[0]).toBe("default-value");
  });
});
