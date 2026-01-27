import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useEntryTypeSync } from "./use-entry-type-sync";

const mockSetItem = vi.fn();
const mockRemoveItem = vi.fn();

vi.stubGlobal("localStorage", {
  setItem: mockSetItem,
  removeItem: mockRemoveItem,
  getItem: vi.fn(),
});

describe("useEntryTypeSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로그인 사용자면 entryType을 member로 설정한다", () => {
    const mockUser = { id: "1", nickname: "TestUser" };

    renderHook(() =>
      useEntryTypeSync({
        currentUser: mockUser,
        storageKey: "ENTRY_TYPE",
      })
    );

    expect(mockSetItem).toHaveBeenCalledWith("ENTRY_TYPE", "member");
  });

  it("비로그인 사용자면 entryType을 guest로 설정한다", () => {
    renderHook(() =>
      useEntryTypeSync({
        currentUser: null,
        storageKey: "ENTRY_TYPE",
      })
    );

    expect(mockSetItem).toHaveBeenCalledWith("ENTRY_TYPE", "guest");
  });

  it("사용자 상태가 변경되면 entryType이 업데이트된다", () => {
    const { rerender } = renderHook(
      ({ currentUser }: { currentUser: { id: string; nickname: string } | null }) =>
        useEntryTypeSync({
          currentUser,
          storageKey: "ENTRY_TYPE",
        }),
      { initialProps: { currentUser: null as { id: string; nickname: string } | null } }
    );

    expect(mockSetItem).toHaveBeenLastCalledWith("ENTRY_TYPE", "guest");

    rerender({ currentUser: { id: "1", nickname: "User" } });

    expect(mockSetItem).toHaveBeenLastCalledWith("ENTRY_TYPE", "member");
  });
});
