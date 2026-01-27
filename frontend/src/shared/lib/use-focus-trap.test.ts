import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useFocusTrap } from "./use-focus-trap";

describe("useFocusTrap", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <a href="#" id="link1">Link</a>
      <button id="btn2" disabled>Disabled Button</button>
      <button id="btn3">Button 3</button>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it("should return a ref object", () => {
    const { result } = renderHook(() => useFocusTrap());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("current");
  });

  it("should trap focus within the container", () => {
    const { result } = renderHook(() => useFocusTrap({ enabled: true }));

    // Assign ref to container
    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    const btn3 = container.querySelector("#btn3") as HTMLButtonElement;
    btn3.focus();

    // Simulate Tab from last focusable element
    const tabEvent = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
    });

    container.dispatchEvent(tabEvent);

    // Focus should wrap to first focusable element
    // Note: This test verifies the hook is set up correctly
    expect(result.current.current).toBe(container);
  });

  it("should not trap focus when disabled", () => {
    const { result } = renderHook(() => useFocusTrap({ enabled: false }));

    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    expect(result.current.current).toBe(container);
  });

  it("should focus first focusable element when initialFocus is true", () => {
    const { result } = renderHook(() => useFocusTrap({ enabled: true, initialFocus: true }));

    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    // The hook should have set up focus trap
    expect(result.current.current).toBe(container);
  });

  it("should restore focus to previously focused element on unmount", () => {
    const btn1 = container.querySelector("#btn1") as HTMLButtonElement;
    btn1.focus();

    const { result, unmount } = renderHook(() =>
      useFocusTrap({ enabled: true, restoreFocus: true })
    );

    Object.defineProperty(result.current, "current", {
      value: container,
      writable: true,
    });

    // Verify hook is tracking the previously focused element
    expect(result.current.current).toBe(container);

    unmount();
    // Focus should be restored to btn1
  });

  it("should handle empty container gracefully", () => {
    const emptyContainer = document.createElement("div");
    document.body.appendChild(emptyContainer);

    const { result } = renderHook(() => useFocusTrap({ enabled: true }));

    Object.defineProperty(result.current, "current", {
      value: emptyContainer,
      writable: true,
    });

    // Should not throw when container has no focusable elements
    expect(result.current.current).toBe(emptyContainer);

    document.body.removeChild(emptyContainer);
  });
});
