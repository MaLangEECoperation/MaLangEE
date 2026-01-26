import { describe, it, expect } from "vitest";

import { AUTH_VALIDATION } from "./validation";

describe("AUTH_VALIDATION", () => {
  describe("LOGIN_ID 검증 상수", () => {
    it("MIN_LENGTH는 4이다", () => {
      expect(AUTH_VALIDATION.LOGIN_ID.MIN_LENGTH).toBe(4);
    });

    it("DEBOUNCE_MS는 1000이다", () => {
      expect(AUTH_VALIDATION.LOGIN_ID.DEBOUNCE_MS).toBe(1000);
    });
  });

  describe("NICKNAME 검증 상수", () => {
    it("MIN_LENGTH는 2이다", () => {
      expect(AUTH_VALIDATION.NICKNAME.MIN_LENGTH).toBe(2);
    });

    it("MAX_LENGTH는 6이다", () => {
      expect(AUTH_VALIDATION.NICKNAME.MAX_LENGTH).toBe(6);
    });

    it("DEBOUNCE_MS는 1000이다", () => {
      expect(AUTH_VALIDATION.NICKNAME.DEBOUNCE_MS).toBe(1000);
    });
  });

  describe("PASSWORD 검증 상수", () => {
    it("MIN_LENGTH는 1이다", () => {
      expect(AUTH_VALIDATION.PASSWORD.MIN_LENGTH).toBe(1);
    });

    it("DEBOUNCE_MS는 300이다", () => {
      expect(AUTH_VALIDATION.PASSWORD.DEBOUNCE_MS).toBe(300);
    });
  });

  describe("TOKEN 관련 상수", () => {
    it("CHECK_INTERVAL_MS는 5분(300000ms)이다", () => {
      expect(AUTH_VALIDATION.TOKEN.CHECK_INTERVAL_MS).toBe(5 * 60 * 1000);
    });
  });

  describe("타입 안전성", () => {
    it("모든 값은 number 타입이다", () => {
      expect(typeof AUTH_VALIDATION.LOGIN_ID.MIN_LENGTH).toBe("number");
      expect(typeof AUTH_VALIDATION.NICKNAME.MIN_LENGTH).toBe("number");
      expect(typeof AUTH_VALIDATION.NICKNAME.MAX_LENGTH).toBe("number");
      expect(typeof AUTH_VALIDATION.PASSWORD.DEBOUNCE_MS).toBe("number");
      expect(typeof AUTH_VALIDATION.TOKEN.CHECK_INTERVAL_MS).toBe("number");
    });
  });
});
