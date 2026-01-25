import { beforeEach, describe, it, expect, vi, afterEach } from "vitest";

import { ApiError } from "../config";
import { fetchClient } from "../fetch-client";

// fetch mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("fetchClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET 요청", () => {
    it("정상 응답을 파싱하여 반환한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1, name: "test" })),
      });

      const result = await fetchClient.get<{ id: number; name: string }>("/users/me");

      expect(result).toEqual({ id: 1, name: "test" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/users/me"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("query params를 URL에 추가한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("[]"),
      });

      await fetchClient.get("/chat/sessions", {
        params: { skip: "0", limit: "10" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("skip=0&limit=10"),
        expect.any(Object)
      );
    });
  });

  describe("POST 요청", () => {
    it("JSON body를 전송한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });

      await fetchClient.post("/auth/signup", { login_id: "test", password: "pass" });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("POST");
      expect(options.body).toBe(JSON.stringify({ login_id: "test", password: "pass" }));
    });

    it("form-urlencoded body를 전송한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ access_token: "tok" })),
      });

      await fetchClient.post(
        "/auth/login",
        { username: "user", password: "pass" },
        { contentType: "form-urlencoded" }
      );

      const [, options] = mockFetch.mock.calls[0];
      expect(options.body).toContain("username=user");
      expect(options.body).toContain("password=pass");
    });
  });

  describe("PUT 요청", () => {
    it("정상적으로 동작한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ status: "success" })),
      });

      const result = await fetchClient.put("/chat/sessions/123/sync");
      expect(result).toEqual({ status: "success" });
    });
  });

  describe("PATCH 요청", () => {
    it("정상적으로 동작한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ updated: true })),
      });

      const result = await fetchClient.patch("/users/me", { nickname: "new" });
      expect(result).toEqual({ updated: true });
    });
  });

  describe("DELETE 요청", () => {
    it("정상적으로 동작한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1, is_active: false })),
      });

      const result = await fetchClient.del("/users/me");
      expect(result).toEqual({ id: 1, is_active: false });
    });
  });

  describe("인증 토큰", () => {
    it("localStorage의 토큰을 Authorization 헤더에 주입한다", async () => {
      localStorageMock.setItem("access_token", "my-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("{}"),
      });

      await fetchClient.get("/users/me");

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("Authorization")).toBe("Bearer my-token");
    });

    it("skipAuth: true이면 토큰을 주입하지 않는다", async () => {
      localStorageMock.setItem("access_token", "my-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("{}"),
      });

      await fetchClient.get("/chat/hints/123", { skipAuth: true });

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("Authorization")).toBeNull();
    });
  });

  describe("에러 처리", () => {
    it("non-2xx 응답에서 ApiError를 throw한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: () => Promise.resolve({ detail: "이미 존재하는 아이디입니다" }),
      });

      await expect(fetchClient.post("/auth/signup", {})).rejects.toThrow(ApiError);
      await expect(fetchClient.post("/auth/signup", {})).rejects.toThrow();
    });

    it("422 에러에서 유효성 검사 메시지를 포함한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: "Unprocessable Entity",
        json: () =>
          Promise.resolve({
            detail: [
              { msg: "필드 A 오류", type: "value_error" },
              { msg: "필드 B 오류", type: "value_error" },
            ],
          }),
      });

      try {
        await fetchClient.post("/auth/signup", {});
      } catch (e) {
        expect(e).toBeInstanceOf(ApiError);
        expect((e as ApiError).status).toBe(422);
        expect((e as ApiError).message).toContain("필드 A 오류");
        expect((e as ApiError).message).toContain("필드 B 오류");
      }
    });

    it("401 에러 시 토큰을 제거한다", async () => {
      localStorageMock.setItem("access_token", "expired-token");

      // window.location mock
      Object.defineProperty(window, "location", {
        value: { pathname: "/dashboard", href: "" },
        writable: true,
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: () => Promise.resolve({ detail: "인증이 필요합니다" }),
      });

      await expect(fetchClient.get("/users/me")).rejects.toThrow(ApiError);
      expect(localStorageMock.getItem("access_token")).toBeNull();
    });
  });

  describe("빈 응답 처리", () => {
    it("빈 text 응답을 undefined로 처리한다", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(""),
      });

      const result = await fetchClient.del("/some-resource");
      expect(result).toBeUndefined();
    });
  });
});
