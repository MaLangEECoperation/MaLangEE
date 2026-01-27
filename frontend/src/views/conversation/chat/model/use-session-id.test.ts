import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useSessionId } from "./use-session-id";

// Next.js 라우터 모킹
const mockReplace = vi.fn();
const mockGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

describe("useSessionId", () => {
  const TEST_STORAGE_KEY = "test-session-id";

  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
    mockGet.mockClear();
  });

  it("URL에 sessionId가 있으면 해당 값을 사용하고 localStorage에 저장한다", async () => {
    mockGet.mockReturnValue("url-session-123");

    const { result } = renderHook(() => useSessionId({ storageKey: TEST_STORAGE_KEY }));

    await waitFor(() => {
      expect(result.current.sessionId).toBe("url-session-123");
    });

    expect(result.current.isInitialized).toBe(true);
    expect(localStorage.getItem(TEST_STORAGE_KEY)).toBe("url-session-123");
  });

  it("URL에 sessionId가 없고 localStorage에 있으면 해당 값을 사용하고 URL을 업데이트한다", async () => {
    mockGet.mockReturnValue(null);
    localStorage.setItem(TEST_STORAGE_KEY, "stored-session-456");

    const { result } = renderHook(() => useSessionId({ storageKey: TEST_STORAGE_KEY }));

    await waitFor(() => {
      expect(result.current.sessionId).toBe("stored-session-456");
    });

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining("sessionId=stored-session-456"),
      expect.any(Object)
    );
  });

  it("URL과 localStorage 둘 다 sessionId가 없으면 hasError를 true로 설정한다", async () => {
    mockGet.mockReturnValue(null);

    const { result } = renderHook(() => useSessionId({ storageKey: TEST_STORAGE_KEY }));

    await waitFor(() => {
      expect(result.current.hasError).toBe(true);
    });

    expect(result.current.sessionId).toBe("");
  });

  it("onError 콜백이 제공되면 에러 시 호출한다", async () => {
    mockGet.mockReturnValue(null);
    const onError = vi.fn();

    renderHook(() => useSessionId({ storageKey: TEST_STORAGE_KEY, onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
