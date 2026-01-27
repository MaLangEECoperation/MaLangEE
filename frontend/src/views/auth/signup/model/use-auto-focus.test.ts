import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { useAutoFocus } from "./use-auto-focus";

describe("useAutoFocus", () => {
  it("마운트 시 setFocus를 지정된 필드명으로 호출한다", () => {
    const setFocus = vi.fn();

    renderHook(() => useAutoFocus(setFocus, "email"));

    expect(setFocus).toHaveBeenCalledWith("email");
    expect(setFocus).toHaveBeenCalledTimes(1);
  });

  it("다른 필드명으로도 작동한다", () => {
    const setFocus = vi.fn();

    renderHook(() => useAutoFocus(setFocus, "password"));

    expect(setFocus).toHaveBeenCalledWith("password");
  });

  it("리렌더링 시 setFocus를 다시 호출하지 않는다", () => {
    const setFocus = vi.fn();

    const { rerender } = renderHook(() => useAutoFocus(setFocus, "email"));

    rerender();
    rerender();

    expect(setFocus).toHaveBeenCalledTimes(1);
  });
});
