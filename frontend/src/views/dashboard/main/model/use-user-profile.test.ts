import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useUserProfile } from "./use-user-profile";

interface MockUser {
  nickname: string;
}

interface MockSession {
  id: string;
  totalDurationSec: number;
  userDurationSec: number;
}

describe("useUserProfile", () => {
  const mockUser: MockUser = { nickname: "TestUser" };

  const mockSessions: MockSession[] = [
    { id: "1", totalDurationSec: 100, userDurationSec: 50 },
    { id: "2", totalDurationSec: 200, userDurationSec: 100 },
    { id: "3", totalDurationSec: 300, userDurationSec: 150 },
  ];

  it("사용자와 세션 데이터로 프로필을 계산한다", () => {
    const { result } = renderHook(() =>
      useUserProfile({
        currentUser: mockUser,
        sessions: mockSessions,
      })
    );

    expect(result.current).toEqual({
      nickname: "TestUser",
      totalDurationSec: 600, // 100 + 200 + 300
      userDurationSec: 300, // 50 + 100 + 150
    });
  });

  it("사용자가 없으면 null을 반환한다", () => {
    const { result } = renderHook(() =>
      useUserProfile({
        currentUser: null,
        sessions: mockSessions,
      })
    );

    expect(result.current).toBeNull();
  });

  it("세션이 없으면 0으로 계산한다", () => {
    const { result } = renderHook(() =>
      useUserProfile({
        currentUser: mockUser,
        sessions: [],
      })
    );

    expect(result.current).toEqual({
      nickname: "TestUser",
      totalDurationSec: 0,
      userDurationSec: 0,
    });
  });

  it("세션 데이터가 변경되면 프로필이 업데이트된다", () => {
    const { result, rerender } = renderHook(
      ({ sessions }) =>
        useUserProfile({
          currentUser: mockUser,
          sessions,
        }),
      { initialProps: { sessions: mockSessions } }
    );

    expect(result.current?.totalDurationSec).toBe(600);

    const newSessions = [...mockSessions, { id: "4", totalDurationSec: 400, userDurationSec: 200 }];

    rerender({ sessions: newSessions });

    expect(result.current?.totalDurationSec).toBe(1000);
  });
});
