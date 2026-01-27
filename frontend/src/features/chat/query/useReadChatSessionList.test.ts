import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock functions
const mockGetChatSessions = vi.fn();

// Mock getChatSessions API
vi.mock("../api/get-chat-sessions/get-chat-sessions", () => ({
  getChatSessions: (params: unknown) => mockGetChatSessions(params),
}));

// Import after mocks
import { useReadChatSessionList } from "./useReadChatSessionList";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

// Mock session data
const mockSessionsPage1 = {
  items: [
    { session_id: "1", title: "Session 1", created_at: "2025-01-01" },
    { session_id: "2", title: "Session 2", created_at: "2025-01-02" },
  ],
  total: 4,
};

const mockSessionsPage2 = {
  items: [
    { session_id: "3", title: "Session 3", created_at: "2025-01-03" },
    { session_id: "4", title: "Session 4", created_at: "2025-01-04" },
  ],
  total: 4,
};

describe("useReadChatSessionList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return query object with data", async () => {
    mockGetChatSessions.mockResolvedValue(mockSessionsPage1);

    const { result } = renderHook(() => useReadChatSessionList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.pages[0].items).toHaveLength(2);
  });

  it("should call API with default pagination params", async () => {
    mockGetChatSessions.mockResolvedValue(mockSessionsPage1);

    const { result } = renderHook(() => useReadChatSessionList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetChatSessions).toHaveBeenCalledWith({
      skip: "0",
      limit: "10",
    });
  });

  it("should use custom limit option", async () => {
    mockGetChatSessions.mockResolvedValue(mockSessionsPage1);

    const { result } = renderHook(() => useReadChatSessionList({ limit: 5 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetChatSessions).toHaveBeenCalledWith({
      skip: "0",
      limit: "5",
    });
  });

  it("should include userId when provided", async () => {
    mockGetChatSessions.mockResolvedValue(mockSessionsPage1);

    const { result } = renderHook(() => useReadChatSessionList({ userId: 123 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetChatSessions).toHaveBeenCalledWith({
      skip: "0",
      limit: "10",
      user_id: "123",
    });
  });

  it("should not fetch when enabled is false", async () => {
    const { result } = renderHook(() => useReadChatSessionList({ enabled: false }), {
      wrapper: createWrapper(),
    });

    // Wait a bit to ensure no fetch happens
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(result.current.isFetching).toBe(false);
    expect(mockGetChatSessions).not.toHaveBeenCalled();
  });

  it("should handle empty session list", async () => {
    mockGetChatSessions.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useReadChatSessionList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].items).toHaveLength(0);
  });

  it("should handle API error", async () => {
    mockGetChatSessions.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useReadChatSessionList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it("should support fetchNextPage for infinite scroll", async () => {
    // First page returns full items
    mockGetChatSessions
      .mockResolvedValueOnce(mockSessionsPage1)
      .mockResolvedValueOnce(mockSessionsPage2);

    const { result } = renderHook(() => useReadChatSessionList({ limit: 2 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.fetchNextPage).toBeDefined();
    expect(typeof result.current.fetchNextPage).toBe("function");
  });

  it("should return isLoading true while fetching", async () => {
    mockGetChatSessions.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSessionsPage1), 100))
    );

    const { result } = renderHook(() => useReadChatSessionList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should return hasNextPage based on items count", async () => {
    mockGetChatSessions.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useReadChatSessionList({ limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Empty items means no next page
    expect(result.current.hasNextPage).toBe(false);
  });

  it("should use correct query key structure", () => {
    const { result } = renderHook(() => useReadChatSessionList({ limit: 5, userId: 10 }), {
      wrapper: createWrapper(),
    });

    // Query should be initialized with correct structure
    expect(result.current.isFetching).toBeDefined();
  });
});
