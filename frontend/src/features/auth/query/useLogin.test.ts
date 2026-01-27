import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock functions
const mockPush = vi.fn();
const mockLogin = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockTokenStorageSet = vi.fn();
const mockUserStorageSet = vi.fn();
const mockFetchClientPut = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock login API
vi.mock("../api/login/login", () => ({
  login: (data: unknown) => mockLogin(data),
}));

// Mock getCurrentUser
vi.mock("../api/get-current-user/get-current-user", () => ({
  getCurrentUser: () => mockGetCurrentUser(),
}));

// Mock storage
vi.mock("../model", () => ({
  tokenStorage: {
    set: (token: string) => mockTokenStorageSet(token),
  },
  userStorage: {
    set: (user: unknown) => mockUserStorageSet(user),
  },
}));

// Mock shared/api fetchClient
vi.mock("@/shared/api", () => ({
  fetchClient: {
    put: (url: string) => mockFetchClientPut(url),
  },
}));

// Import after mocks
import { useLogin } from "./useLogin";

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

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // localStorage mock
    const mockLocalStorage: Record<string, string> = {};
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(
      (key) => mockLocalStorage[key] || null
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
      mockLocalStorage[key] = value;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should return mutation object with mutate function", () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(result.current.mutateAsync).toBeDefined();
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("should call login API with correct credentials", async () => {
    const mockToken = "test-access-token";
    const mockUser = { id: 1, login_id: "testuser", nickname: "Test" };

    mockLogin.mockResolvedValue({ access_token: mockToken });
    mockGetCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ username: "testuser", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockLogin).toHaveBeenCalledWith({
      username: "testuser",
      password: "password123",
    });
  });

  it("should store token on successful login", async () => {
    const mockToken = "test-access-token";
    const mockUser = { id: 1, login_id: "testuser", nickname: "Test" };

    mockLogin.mockResolvedValue({ access_token: mockToken });
    mockGetCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ username: "testuser", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTokenStorageSet).toHaveBeenCalledWith(mockToken);
  });

  it("should fetch and store user data after login", async () => {
    const mockToken = "test-access-token";
    const mockUser = { id: 1, login_id: "testuser", nickname: "Test" };

    mockLogin.mockResolvedValue({ access_token: mockToken });
    mockGetCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ username: "testuser", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetCurrentUser).toHaveBeenCalled();
    expect(mockUserStorageSet).toHaveBeenCalledWith(mockUser);
  });

  it("should navigate to dashboard on success", async () => {
    const mockToken = "test-access-token";
    const mockUser = { id: 1, login_id: "testuser", nickname: "Test" };

    mockLogin.mockResolvedValue({ access_token: mockToken });
    mockGetCurrentUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ username: "testuser", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle login API error", async () => {
    const mockError = new Error("Invalid credentials");
    mockLogin.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ username: "testuser", password: "wrongpassword" });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should handle getCurrentUser error gracefully", async () => {
    const mockToken = "test-access-token";

    mockLogin.mockResolvedValue({ access_token: mockToken });
    mockGetCurrentUser.mockRejectedValue(new Error("User fetch failed"));

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ username: "testuser", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should still navigate to dashboard even if user fetch fails
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("should sync guest session if exists", async () => {
    const mockToken = "test-access-token";
    const mockUser = { id: 1, login_id: "testuser", nickname: "Test" };

    mockLogin.mockResolvedValue({ access_token: mockToken });
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockFetchClientPut.mockResolvedValue({});

    // Set guest session in localStorage
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "chatSessionId") return "guest-session-123";
      if (key === "entryType") return "guest";
      return null;
    });

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ username: "testuser", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Session sync should be attempted
    await waitFor(() => {
      expect(mockFetchClientPut).toHaveBeenCalledWith("/chat/sessions/guest-session-123/sync");
    });
  });

  it("should set isPending to true while mutation is running", async () => {
    let resolveLogin: (value: { access_token: string }) => void;
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );
    mockGetCurrentUser.mockResolvedValue({ id: 1, login_id: "test" });

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ username: "testuser", password: "password123" });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve the pending promise
    await act(async () => {
      resolveLogin!({ access_token: "token" });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
