/**
 * fetchClient 테스트
 * 클라이언트/서버 듀얼 모드 지원 검증
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("fetchClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("server mode (serverToken option)", () => {
    it("should use serverToken when provided instead of localStorage", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: 1 })),
      });
      global.fetch = mockFetch;

      const { fetchClient } = await import("./fetch-client");

      await fetchClient.get("/test", { serverToken: "server-side-token" });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.get("Authorization")).toBe("Bearer server-side-token");
    });

    it("should not access localStorage when serverToken is provided", async () => {
      const getItemSpy = vi.fn();
      vi.stubGlobal("localStorage", { getItem: getItemSpy });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: "test" })),
      });
      global.fetch = mockFetch;

      const { fetchClient } = await import("./fetch-client");

      await fetchClient.get("/test", { serverToken: "server-token" });

      // serverToken 사용 시 localStorage.getItem은 호출되지 않아야 함
      expect(getItemSpy).not.toHaveBeenCalled();
    });

    it("should fallback to localStorage when serverToken is not provided", async () => {
      const getItemSpy = vi.fn().mockReturnValue("local-token");
      vi.stubGlobal("localStorage", { getItem: getItemSpy });

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: "test" })),
      });
      global.fetch = mockFetch;

      const { fetchClient } = await import("./fetch-client");

      await fetchClient.get("/test");

      expect(getItemSpy).toHaveBeenCalled();
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.get("Authorization")).toBe("Bearer local-token");
    });
  });

  describe("skipAuth option", () => {
    it("should skip auth header when skipAuth is true", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: "test" })),
      });
      global.fetch = mockFetch;

      const { fetchClient } = await import("./fetch-client");

      await fetchClient.get("/test", { skipAuth: true });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.has("Authorization")).toBe(false);
    });

    it("should ignore serverToken when skipAuth is true", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: "test" })),
      });
      global.fetch = mockFetch;

      const { fetchClient } = await import("./fetch-client");

      await fetchClient.get("/test", { serverToken: "token", skipAuth: true });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.has("Authorization")).toBe(false);
    });
  });
});
