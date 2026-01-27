import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useMuteOnMount } from "./use-mute-on-mount";

describe("useMuteOnMount", () => {
  const mockMute = vi.fn();
  const mockSetAudioEnabled = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("마운트 시 mute 함수를 호출한다", () => {
    renderHook(() =>
      useMuteOnMount({
        mute: mockMute,
        setAudioEnabled: mockSetAudioEnabled,
      })
    );

    expect(mockMute).toHaveBeenCalledTimes(1);
  });

  it("마운트 시 setAudioEnabled(false)를 호출한다", () => {
    renderHook(() =>
      useMuteOnMount({
        mute: mockMute,
        setAudioEnabled: mockSetAudioEnabled,
      })
    );

    expect(mockSetAudioEnabled).toHaveBeenCalledWith(false);
  });

  it("리렌더링 시에는 다시 호출하지 않는다", () => {
    const { rerender } = renderHook(() =>
      useMuteOnMount({
        mute: mockMute,
        setAudioEnabled: mockSetAudioEnabled,
      })
    );

    rerender();
    rerender();

    expect(mockMute).toHaveBeenCalledTimes(1);
    expect(mockSetAudioEnabled).toHaveBeenCalledTimes(1);
  });

  it("함수가 없으면 오류 없이 동작한다", () => {
    expect(() => {
      renderHook(() =>
        useMuteOnMount({
          mute: undefined as unknown as () => void,
          setAudioEnabled: mockSetAudioEnabled,
        })
      );
    }).not.toThrow();
  });
});
