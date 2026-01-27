import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { useClearPreviousSession } from "./use-clear-previous-session";

describe("useClearPreviousSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("마운트 시 지정된 키들을 localStorage에서 제거한다", () => {
    localStorage.setItem("key1", "value1");
    localStorage.setItem("key2", "value2");
    localStorage.setItem("key3", "value3");

    renderHook(() => useClearPreviousSession(["key1", "key2"]));

    expect(localStorage.getItem("key1")).toBeNull();
    expect(localStorage.getItem("key2")).toBeNull();
    expect(localStorage.getItem("key3")).toBe("value3"); // 제거 안 됨
  });

  it("빈 배열이면 아무것도 제거하지 않는다", () => {
    localStorage.setItem("key1", "value1");

    renderHook(() => useClearPreviousSession([]));

    expect(localStorage.getItem("key1")).toBe("value1");
  });

  it("존재하지 않는 키도 안전하게 처리한다", () => {
    expect(() => {
      renderHook(() => useClearPreviousSession(["nonexistent-key"]));
    }).not.toThrow();
  });
});
