import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("shared/config/api", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should export API_BASE_URL from environment variable", async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://test-server:8080";
    const { API_BASE_URL } = await import("./api");
    expect(API_BASE_URL).toBe("http://test-server:8080");
  });

  it("should fallback to default API_BASE_URL when env is not set", async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    const { API_BASE_URL } = await import("./api");
    expect(API_BASE_URL).toBe("http://49.50.137.35:8080");
  });

  it("should export API_BASE_PATH", async () => {
    const { API_BASE_PATH } = await import("./api");
    expect(API_BASE_PATH).toBe("/api/v1");
  });

  it("should export getApiUrl function", async () => {
    const { getApiUrl } = await import("./api");
    expect(typeof getApiUrl).toBe("function");
  });

  it("should return relative path in browser environment", async () => {
    const { getApiUrl } = await import("./api");
    // jsdom 환경에서는 window가 존재
    expect(getApiUrl()).toBe("/api/v1");
  });
});
