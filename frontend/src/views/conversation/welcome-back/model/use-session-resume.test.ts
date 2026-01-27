import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { useSessionResume } from "./use-session-resume";

describe("useSessionResume", () => {
  const STORAGE_KEY = "test-session-id";

  beforeEach(() => {
    localStorage.clear();
  });

  it("sessionId가 있으면 canResume이 true이다", () => {
    const { result } = renderHook(() =>
      useSessionResume({
        sessionId: "session-123",
        storageKey: STORAGE_KEY,
      })
    );

    expect(result.current.canResume).toBe(true);
  });

  it("sessionId가 없으면 canResume이 false이다", () => {
    const { result } = renderHook(() =>
      useSessionResume({
        sessionId: null,
        storageKey: STORAGE_KEY,
      })
    );

    expect(result.current.canResume).toBe(false);
  });

  it("빈 문자열 sessionId는 canResume이 false이다", () => {
    const { result } = renderHook(() =>
      useSessionResume({
        sessionId: "",
        storageKey: STORAGE_KEY,
      })
    );

    expect(result.current.canResume).toBe(false);
  });

  it("clearSession 호출 시 localStorage에서 세션을 제거한다", () => {
    localStorage.setItem(STORAGE_KEY, "session-123");

    const { result } = renderHook(() =>
      useSessionResume({
        sessionId: "session-123",
        storageKey: STORAGE_KEY,
      })
    );

    act(() => {
      result.current.clearSession();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
