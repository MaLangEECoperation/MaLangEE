import { describe, it, expect } from "vitest";

import { CHAT_QUERY_CONFIG, CHAT_PAGINATION, CHAT_VOICE_OPTIONS, CHAT_TIMER } from "./index";

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

  describe("CHAT_TIMER", () => {
    it("HINT_DELAY_MS는 15초(15000ms)이다", () => {
      expect(CHAT_TIMER.HINT_DELAY_MS).toBe(15_000);
    });

    it("WAIT_POPUP_DELAY_MS는 5초(5000ms)이다", () => {
      expect(CHAT_TIMER.WAIT_POPUP_DELAY_MS).toBe(5_000);
    });

    it("RESPONSE_REQUEST_DELAY_MS는 500ms이다", () => {
      expect(CHAT_TIMER.RESPONSE_REQUEST_DELAY_MS).toBe(500);
    });

    it("모든 값은 number 타입이다", () => {
      expect(typeof CHAT_TIMER.HINT_DELAY_MS).toBe("number");
      expect(typeof CHAT_TIMER.WAIT_POPUP_DELAY_MS).toBe("number");
      expect(typeof CHAT_TIMER.RESPONSE_REQUEST_DELAY_MS).toBe("number");
    });
  });
});
