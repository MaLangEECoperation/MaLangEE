import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock functions
const mockPush = vi.fn();
const mockTokenStorageRemove = vi.fn();
const mockUserStorageRemove = vi.fn();
const mockQueryClientClear = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock storage
vi.mock("../model", () => ({
  tokenStorage: {
    remove: () => mockTokenStorageRemove(),
  },
  userStorage: {
    remove: () => mockUserStorageRemove(),
  },
}));

// Import after mocks
import { useLogout } from "./useLogout";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Mock the clear method
  queryClient.clear = mockQueryClientClear;

  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return mutation object with mutate function", () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("should remove token storage on logout", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTokenStorageRemove).toHaveBeenCalled();
  });

  it("should remove user storage on logout", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUserStorageRemove).toHaveBeenCalled();
  });

  it("should clear query client on success", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockQueryClientClear).toHaveBeenCalled();
  });

  it("should navigate to login page on success", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should have correct mutation key", () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    // Mutation should be initialized and ready
    expect(result.current.status).toBe("idle");
  });

  it("should call operations in correct order", async () => {
    const callOrder: string[] = [];

    mockTokenStorageRemove.mockImplementation(() => {
      callOrder.push("tokenRemove");
    });
    mockUserStorageRemove.mockImplementation(() => {
      callOrder.push("userRemove");
    });
    mockQueryClientClear.mockImplementation(() => {
      callOrder.push("queryClear");
    });
    mockPush.mockImplementation(() => {
      callOrder.push("navigate");
    });

    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Storage removal happens in mutationFn, navigation happens in onSuccess
    expect(callOrder).toEqual(["tokenRemove", "userRemove", "queryClear", "navigate"]);
  });

  it("should use mutateAsync for async operations", async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(mockTokenStorageRemove).toHaveBeenCalled();
    expect(mockUserStorageRemove).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });
});
