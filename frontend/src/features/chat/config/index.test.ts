import { describe, it, expect } from "vitest";

import { CHAT_QUERY_CONFIG, CHAT_PAGINATION, CHAT_VOICE_OPTIONS } from "./index";

describe("features/chat/config", () => {
  describe("CHAT_QUERY_CONFIG", () => {
    it("should have session staleTime as 5 minutes in ms", () => {
      expect(CHAT_QUERY_CONFIG.SESSION_STALE_TIME).toBe(1000 * 60 * 5);
    });

    it("should have hints staleTime as 1 minute in ms", () => {
      expect(CHAT_QUERY_CONFIG.HINTS_STALE_TIME).toBe(1000 * 60);
    });
  });

  describe("CHAT_PAGINATION", () => {
    it("should have default page size as 10", () => {
      expect(CHAT_PAGINATION.DEFAULT_PAGE_SIZE).toBe(10);
    });
  });

  describe("CHAT_VOICE_OPTIONS", () => {
    it("should contain all available voice options", () => {
      expect(CHAT_VOICE_OPTIONS).toContain("alloy");
      expect(CHAT_VOICE_OPTIONS).toContain("coral");
      expect(CHAT_VOICE_OPTIONS).toContain("sage");
    });

    it("should have alloy as the first (default) option", () => {
      expect(CHAT_VOICE_OPTIONS[0]).toBe("alloy");
    });

    it("should have 8 voice options", () => {
      expect(CHAT_VOICE_OPTIONS).toHaveLength(8);
    });
  });
});
