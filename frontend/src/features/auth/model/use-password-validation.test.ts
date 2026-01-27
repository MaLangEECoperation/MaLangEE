"use client";

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { usePasswordValidation } from "./use-password-validation";

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
