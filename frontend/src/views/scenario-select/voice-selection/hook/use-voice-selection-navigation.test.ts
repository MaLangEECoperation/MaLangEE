import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useVoiceSelectionNavigation } from "./use-voice-selection-navigation";

const mockPush = vi.fn();
const mockSetItem = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.stubGlobal("localStorage", {
  setItem: mockSetItem,
  getItem: vi.fn(),
  removeItem: vi.fn(),
});

describe("useVoiceSelectionNavigation", () => {
  const mockStopSample = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("음성을 저장하고 대화 페이지로 이동한다", () => {
    const { result } = renderHook(() =>
      useVoiceSelectionNavigation({
        voiceId: "shimmer",
        sessionId: "session123",
        stopSample: mockStopSample,
        storageKey: "SELECTED_VOICE",
        chatRoute: "/conversation/chat",
      })
    );

    act(() => {
      result.current();
    });

    expect(mockStopSample).toHaveBeenCalled();
    expect(mockSetItem).toHaveBeenCalledWith("SELECTED_VOICE", "shimmer");
    expect(mockPush).toHaveBeenCalledWith("/conversation/chat?sessionId=session123");
  });

  it("세션 ID가 없으면 쿼리 파라미터 없이 이동한다", () => {
    const { result } = renderHook(() =>
      useVoiceSelectionNavigation({
        voiceId: "echo",
        sessionId: null,
        stopSample: mockStopSample,
        storageKey: "SELECTED_VOICE",
        chatRoute: "/conversation/chat",
      })
    );

    act(() => {
      result.current();
    });

    expect(mockPush).toHaveBeenCalledWith("/conversation/chat");
  });

  it("stopSample 함수가 없어도 오류 없이 동작한다", () => {
    const { result } = renderHook(() =>
      useVoiceSelectionNavigation({
        voiceId: "shimmer",
        sessionId: "session123",
        stopSample: undefined as unknown as () => void,
        storageKey: "SELECTED_VOICE",
        chatRoute: "/conversation/chat",
      })
    );

    expect(() => {
      act(() => {
        result.current();
      });
    }).not.toThrow();
  });
});
