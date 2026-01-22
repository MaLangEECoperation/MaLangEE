/**
 * @fileoverview STORAGE_KEYS 상수 테스트
 * TDD: RED 단계 - 테스트 먼저 작성
 */
import { describe, it, expect } from "vitest";

import { STORAGE_KEYS, type StorageKey } from "./storage-keys";

describe("STORAGE_KEYS", () => {
  describe("키 형식 검증", () => {
    it("ACCESS_TOKEN을 제외한 모든 키가 camelCase 형식이어야 함", () => {
      // ACCESS_TOKEN은 기존 호환성을 위해 snake_case 예외 허용
      const ALLOWED_SNAKE_CASE = ["access_token"];

      Object.values(STORAGE_KEYS).forEach((key) => {
        if (!ALLOWED_SNAKE_CASE.includes(key)) {
          // snake_case는 underscore 포함
          expect(key).not.toMatch(/_/);
        }
      });
    });

    it("ACCESS_TOKEN은 기존 호환성을 위해 snake_case 허용", () => {
      expect(STORAGE_KEYS.ACCESS_TOKEN).toBe("access_token");
    });

    it("모든 키는 비어있지 않은 문자열이어야 함", () => {
      Object.values(STORAGE_KEYS).forEach((key) => {
        expect(typeof key).toBe("string");
        expect(key.length).toBeGreaterThan(0);
      });
    });
  });

  describe("키 중복 검증", () => {
    it("중복된 키 값이 없어야 함", () => {
      const values = Object.values(STORAGE_KEYS);
      const uniqueValues = new Set(values);
      expect(values.length).toBe(uniqueValues.size);
    });
  });

  describe("필수 키 존재 검증", () => {
    it("인증 관련 키가 존재해야 함", () => {
      expect(STORAGE_KEYS.ACCESS_TOKEN).toBeDefined();
      expect(STORAGE_KEYS.USER).toBeDefined();
      expect(STORAGE_KEYS.ENTRY_TYPE).toBeDefined();
      expect(STORAGE_KEYS.LOGIN_ID).toBeDefined();
    });

    it("시나리오 관련 키가 존재해야 함", () => {
      expect(STORAGE_KEYS.CONVERSATION_GOAL).toBeDefined();
      expect(STORAGE_KEYS.CONVERSATION_PARTNER).toBeDefined();
      expect(STORAGE_KEYS.PLACE).toBeDefined();
    });

    it("채팅 세션 관련 키가 존재해야 함", () => {
      expect(STORAGE_KEYS.CHAT_SESSION_ID).toBeDefined();
      expect(STORAGE_KEYS.SELECTED_VOICE).toBeDefined();
      expect(STORAGE_KEYS.SUBTITLE_ENABLED).toBeDefined();
    });
  });

  describe("시나리오 키 camelCase 검증 (버그 수정 검증)", () => {
    it("CONVERSATION_GOAL은 camelCase여야 함 (snake_case conversation_goal 금지)", () => {
      expect(STORAGE_KEYS.CONVERSATION_GOAL).toBe("conversationGoal");
      expect(STORAGE_KEYS.CONVERSATION_GOAL).not.toBe("conversation_goal");
    });

    it("CONVERSATION_PARTNER는 camelCase여야 함 (snake_case conversation_partner 금지)", () => {
      expect(STORAGE_KEYS.CONVERSATION_PARTNER).toBe("conversationPartner");
      expect(STORAGE_KEYS.CONVERSATION_PARTNER).not.toBe("conversation_partner");
    });

    it("PLACE는 camelCase여야 함", () => {
      expect(STORAGE_KEYS.PLACE).toBe("place");
    });
  });

  describe("타입 검증", () => {
    it("StorageKey 타입은 STORAGE_KEYS의 값 타입이어야 함", () => {
      // 타입 추론 검증 - 컴파일 타임에 검증됨
      const key: StorageKey = STORAGE_KEYS.ACCESS_TOKEN;
      expect(typeof key).toBe("string");
    });

    it("STORAGE_KEYS는 객체 타입이어야 함", () => {
      // as const는 컴파일 타임에만 효과, 런타임에서는 객체로 존재
      expect(typeof STORAGE_KEYS).toBe("object");
      expect(STORAGE_KEYS).not.toBeNull();
    });
  });
});
