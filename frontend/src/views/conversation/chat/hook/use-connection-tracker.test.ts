import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useConnectionTracker } from "./use-connection-tracker";

describe("useConnectionTracker", () => {
  it("초기 상태에서 wasConnected는 false이다", () => {
    const { result } = renderHook(() => useConnectionTracker({ isConnected: false }));

    expect(result.current.wasConnected).toBe(false);
  });

  it("isConnected가 true가 되면 wasConnected도 true가 된다", () => {
    const { result, rerender } = renderHook(
      ({ isConnected }) => useConnectionTracker({ isConnected }),
      { initialProps: { isConnected: false } }
    );

    expect(result.current.wasConnected).toBe(false);

    rerender({ isConnected: true });

    expect(result.current.wasConnected).toBe(true);
  });

  it("isConnected가 다시 false가 되어도 wasConnected는 true를 유지한다", () => {
    const { result, rerender } = renderHook(
      ({ isConnected }) => useConnectionTracker({ isConnected }),
      { initialProps: { isConnected: false } }
    );

    rerender({ isConnected: true });
    expect(result.current.wasConnected).toBe(true);

    rerender({ isConnected: false });
    expect(result.current.wasConnected).toBe(true);
  });
});
