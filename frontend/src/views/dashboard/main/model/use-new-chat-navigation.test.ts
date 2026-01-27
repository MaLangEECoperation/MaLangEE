import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useNewChatNavigation } from "./use-new-chat-navigation";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("useNewChatNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("사용자와 세션이 있으면 welcome-back으로 이동한다", () => {
    const mockUser = { id: "1", nickname: "TestUser" };
    const mockSessions = [{ id: "session1" }];

    const { result } = renderHook(() =>
      useNewChatNavigation({
        currentUser: mockUser,
        sessions: mockSessions,
        routes: {
          welcomeBack: "/conversation/welcome-back",
          topicSuggestion: "/scenario-select/topic-suggestion",
        },
      })
    );

    act(() => {
      result.current();
    });

    expect(mockPush).toHaveBeenCalledWith("/conversation/welcome-back");
  });

  it("사용자는 있지만 세션이 없으면 topic-suggestion으로 이동한다", () => {
    const mockUser = { id: "1", nickname: "TestUser" };

    const { result } = renderHook(() =>
      useNewChatNavigation({
        currentUser: mockUser,
        sessions: [],
        routes: {
          welcomeBack: "/conversation/welcome-back",
          topicSuggestion: "/scenario-select/topic-suggestion",
        },
      })
    );

    act(() => {
      result.current();
    });

    expect(mockPush).toHaveBeenCalledWith("/scenario-select/topic-suggestion");
  });

  it("비로그인 사용자는 topic-suggestion으로 이동한다", () => {
    const { result } = renderHook(() =>
      useNewChatNavigation({
        currentUser: null,
        sessions: [],
        routes: {
          welcomeBack: "/conversation/welcome-back",
          topicSuggestion: "/scenario-select/topic-suggestion",
        },
      })
    );

    act(() => {
      result.current();
    });

    expect(mockPush).toHaveBeenCalledWith("/scenario-select/topic-suggestion");
  });
});
