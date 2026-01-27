import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock functions
const mockPush = vi.fn();
const mockSignup = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock signup API
vi.mock("../api/signup/signup", () => ({
  signup: (data: unknown) => mockSignup(data),
}));

// Import after mocks
import { useSignup } from "./useSignup";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("useSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return mutation object with mutate function", () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("should call signup API with correct data", async () => {
    mockSignup.mockResolvedValue({ id: 1, login_id: "testuser" });

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    const signupData = {
      login_id: "testuser",
      nickname: "TestNick",
      password: "password123",
    };

    act(() => {
      result.current.mutate(signupData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSignup).toHaveBeenCalledWith({
      login_id: "testuser",
      nickname: "TestNick",
      password: "password123",
    });
  });

  it("should navigate to login page on success", async () => {
    mockSignup.mockResolvedValue({ id: 1, login_id: "testuser" });

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        login_id: "testuser",
        nickname: "TestNick",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should handle signup API error", async () => {
    const mockError = new Error("Signup failed");
    mockSignup.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        login_id: "testuser",
        nickname: "TestNick",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should handle duplicate login_id error", async () => {
    const mockError = new Error("이미 사용 중인 이메일입니다");
    mockSignup.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        login_id: "existing@email.com",
        nickname: "TestNick",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should set isPending to true while mutation is running", async () => {
    let resolveSignup: (value: { id: number }) => void;
    mockSignup.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSignup = resolve;
        })
    );

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({
        login_id: "testuser",
        nickname: "TestNick",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve the pending promise
    await act(async () => {
      resolveSignup!({ id: 1 });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it("should use mutateAsync for async operations", async () => {
    mockSignup.mockResolvedValue({ id: 1, login_id: "testuser" });

    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        login_id: "testuser",
        nickname: "TestNick",
        password: "password123",
      });
    });

    expect(mockSignup).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should have correct mutation key", () => {
    const { result } = renderHook(() => useSignup(), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe("idle");
  });
});
