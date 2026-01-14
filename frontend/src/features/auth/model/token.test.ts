import { describe, it, expect, beforeEach, vi } from "vitest";
import { tokenStorage } from "./token";

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("set", () => {
    it("should store token in localStorage", () => {
      tokenStorage.set("test-token");
      expect(localStorage.getItem("access_token")).toBe("test-token");
    });
  });

  describe("get", () => {
    it("should return token from localStorage", () => {
      localStorage.setItem("access_token", "stored-token");
      expect(tokenStorage.get()).toBe("stored-token");
    });

    it("should return null when no token exists", () => {
      expect(tokenStorage.get()).toBeNull();
    });
  });

  describe("remove", () => {
    it("should remove token from localStorage", () => {
      localStorage.setItem("access_token", "to-remove");
      tokenStorage.remove();
      expect(localStorage.getItem("access_token")).toBeNull();
    });
  });

  describe("exists", () => {
    it("should return true when token exists", () => {
      localStorage.setItem("access_token", "existing-token");
      expect(tokenStorage.exists()).toBe(true);
    });

    it("should return false when no token exists", () => {
      expect(tokenStorage.exists()).toBe(false);
    });
  });
});
