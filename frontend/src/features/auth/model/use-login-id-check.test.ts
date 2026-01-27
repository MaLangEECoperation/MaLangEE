"use client";

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useLoginIdCheck } from "./use-login-id-check";

// Mock API functions
const mockCheckLoginId = vi.fn();

vi.mock("../api/check-login-id/check-login-id", () => ({
  checkLoginId: (...args: unknown[]) => mockCheckLoginId(...args),
}));

describe("useLoginIdCheck", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should initialize with null values", () => {
    const { result } = renderHook(() => useLoginIdCheck(""));

    expect(result.current.error).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBeNull();
  });

  it("should not check when value is too short", async () => {
    const { result } = renderHook(() => useLoginIdCheck("ab"));

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockCheckLoginId).not.toHaveBeenCalled();
    expect(result.current.isAvailable).toBeNull();
  });

  it("should check after debounce when value is valid", async () => {
    mockCheckLoginId.mockResolvedValue({ is_available: true });

    renderHook(() => useLoginIdCheck("test@test.com"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockCheckLoginId).toHaveBeenCalledWith("test@test.com");
  });

  it("should set isAvailable to true when available", async () => {
    mockCheckLoginId.mockResolvedValue({ is_available: true });

    const { result } = renderHook(() => useLoginIdCheck("test@test.com"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should set error when not available", async () => {
    mockCheckLoginId.mockResolvedValue({ is_available: false });

    const { result } = renderHook(() => useLoginIdCheck("taken@test.com"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.error).toBe("이미 사용중인 이메일입니다");
  });

  it("should handle API error", async () => {
    mockCheckLoginId.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useLoginIdCheck("test@test.com"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.isAvailable).toBeNull();
  });

  it("should have trigger function", () => {
    const { result } = renderHook(() => useLoginIdCheck("test@test.com"));
    expect(typeof result.current.trigger).toBe("function");
  });
});
