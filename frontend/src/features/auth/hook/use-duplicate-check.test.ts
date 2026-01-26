import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useLoginIdCheck, useNicknameCheck, usePasswordValidation } from "./use-duplicate-check";

// Mock API functions
const mockCheckLoginId = vi.fn();
const mockCheckNickname = vi.fn();

vi.mock("../api/check-login-id/check-login-id", () => ({
  checkLoginId: (...args: unknown[]) => mockCheckLoginId(...args),
}));

vi.mock("../api/check-nickname/check-nickname", () => ({
  checkNickname: (...args: unknown[]) => mockCheckNickname(...args),
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

describe("usePasswordValidation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("should initialize with null values", () => {
    const { result } = renderHook(() => usePasswordValidation(""));

    expect(result.current.error).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isValid).toBeNull();
  });

  it("should validate password after debounce", async () => {
    const { result } = renderHook(() => usePasswordValidation("ValidPass1!"));

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.isChecking).toBe(false);
  });

  it("should set isValid to true for valid password", async () => {
    const { result } = renderHook(() => usePasswordValidation("ValidPass1!"));

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("should set error for invalid password", async () => {
    const { result } = renderHook(() => usePasswordValidation("weak"));

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.error).not.toBeNull();
  });

  it("should reset when value becomes empty", async () => {
    const { result, rerender } = renderHook(({ value }) => usePasswordValidation(value), {
      initialProps: { value: "ValidPass1!" },
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
      await Promise.resolve();
    });

    expect(result.current.isValid).toBe(true);

    rerender({ value: "" });

    expect(result.current.error).toBeNull();
    expect(result.current.isValid).toBeNull();
  });
});
