"use client";

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useNicknameCheck } from "./use-nickname-check";

// Mock API functions
const mockCheckNickname = vi.fn();

vi.mock("../api/check-nickname/check-nickname", () => ({
  checkNickname: (...args: unknown[]) => mockCheckNickname(...args),
}));

describe("useNicknameCheck", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should initialize with null values", () => {
    const { result } = renderHook(() => useNicknameCheck(""));

    expect(result.current.error).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBeNull();
  });

  it("should not check when value is too short", async () => {
    renderHook(() => useNicknameCheck("a"));

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockCheckNickname).not.toHaveBeenCalled();
  });

  it("should check after debounce when value is valid", async () => {
    mockCheckNickname.mockResolvedValue({ is_available: true });

    // 닉네임 규칙: 2~6자, 영문 또는 한글만 허용
    renderHook(() => useNicknameCheck("테스터"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockCheckNickname).toHaveBeenCalledWith("테스터");
  });

  it("should set error when nickname is taken", async () => {
    mockCheckNickname.mockResolvedValue({ is_available: false });

    // 닉네임 규칙: 2~6자, 영문 또는 한글만 허용
    const { result } = renderHook(() => useNicknameCheck("사용중"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.error).toBe("이미 사용중인 닉네임입니다");
  });
});
