import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  isDev,
  debugLog,
  debugError,
  debugWarn,
  debugInfo,
  prodLog,
  prodError,
  prodWarn,
} from "./debug";

describe("debug utilities", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    process.env = { ...originalEnv };
  });

  describe("isDev", () => {
    it("should return false (disabled for production safety)", () => {
      // isDev()는 프로덕션 안전을 위해 항상 false 반환
      expect(isDev()).toBe(false);
    });
  });

  describe("debugLog", () => {
    it("should not log when isDev returns false", () => {
      // isDev()가 false이므로 로그가 출력되지 않음
      debugLog("test message", { data: 123 });
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("debugError", () => {
    it("should not log when isDev returns false", () => {
      // isDev()가 false이므로 에러가 출력되지 않음
      debugError("error message", new Error("test"));
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe("debugWarn", () => {
    it("should not log when isDev returns false", () => {
      // isDev()가 false이므로 경고가 출력되지 않음
      debugWarn("warning message");
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe("debugInfo", () => {
    it("should not log when isDev returns false", () => {
      // isDev()가 false이므로 정보가 출력되지 않음
      debugInfo("info message");
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe("prodLog", () => {
    it("should always log regardless of environment", () => {
      vi.stubEnv("NODE_ENV", "production");
      prodLog("important message");
      expect(console.log).toHaveBeenCalledWith("important message");

      vi.stubEnv("NODE_ENV", "development");
      prodLog("dev message");
      expect(console.log).toHaveBeenCalledWith("dev message");
    });
  });

  describe("prodError", () => {
    it("should always log error regardless of environment", () => {
      vi.stubEnv("NODE_ENV", "production");
      prodError("critical error");
      expect(console.error).toHaveBeenCalledWith("critical error");
    });
  });

  describe("prodWarn", () => {
    it("should always log warning regardless of environment", () => {
      vi.stubEnv("NODE_ENV", "production");
      prodWarn("important warning");
      expect(console.warn).toHaveBeenCalledWith("important warning");
    });
  });
});
