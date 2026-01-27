import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { useSessionStorageState } from "./use-session-storage-state";

describe("useSessionStorageState", () => {
  const TEST_KEY = "test-session-key";

  beforeEach(() => {
    sessionStorage.clear();
  });

  it("sessionStorage에 값이 있으면 초기값으로 로드한다", () => {
    sessionStorage.setItem(TEST_KEY, JSON.stringify("stored-value"));

    const { result } = renderHook(() => useSessionStorageState(TEST_KEY, "default-value"));

    expect(result.current[0]).toBe("stored-value");
  });

  it("sessionStorage에 값이 없으면 기본값을 반환한다", () => {
    const { result } = renderHook(() => useSessionStorageState(TEST_KEY, "default-value"));

    expect(result.current[0]).toBe("default-value");
  });

  it("값 변경 시 sessionStorage를 업데이트한다", () => {
    const { result } = renderHook(() => useSessionStorageState(TEST_KEY, "initial"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(JSON.parse(sessionStorage.getItem(TEST_KEY)!)).toBe("new-value");
  });

  it("sessionStorage에서 JSON 파싱 오류 시 기본값을 반환한다", () => {
    sessionStorage.setItem(TEST_KEY, "invalid-json{");

    const { result } = renderHook(() => useSessionStorageState(TEST_KEY, "default-value"));

    expect(result.current[0]).toBe("default-value");
  });
});
