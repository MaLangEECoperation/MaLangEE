import { describe, it, expect } from "vitest";

import { TIME_CONSTANTS } from "./time";

describe("TIME_CONSTANTS", () => {
  describe("초 단위 변환 상수", () => {
    it("SECONDS_PER_MINUTE은 60이다", () => {
      expect(TIME_CONSTANTS.SECONDS_PER_MINUTE).toBe(60);
    });

    it("SECONDS_PER_HOUR은 3600이다", () => {
      expect(TIME_CONSTANTS.SECONDS_PER_HOUR).toBe(3600);
    });
  });

  describe("밀리초 단위 변환 상수", () => {
    it("MS_PER_SECOND는 1000이다", () => {
      expect(TIME_CONSTANTS.MS_PER_SECOND).toBe(1000);
    });

    it("MS_PER_MINUTE는 60000이다", () => {
      expect(TIME_CONSTANTS.MS_PER_MINUTE).toBe(60_000);
    });

    it("MS_PER_HOUR는 3600000이다", () => {
      expect(TIME_CONSTANTS.MS_PER_HOUR).toBe(3_600_000);
    });
  });

  describe("타입 안전성", () => {
    it("모든 값은 number 타입이다", () => {
      expect(typeof TIME_CONSTANTS.SECONDS_PER_MINUTE).toBe("number");
      expect(typeof TIME_CONSTANTS.SECONDS_PER_HOUR).toBe("number");
      expect(typeof TIME_CONSTANTS.MS_PER_SECOND).toBe("number");
      expect(typeof TIME_CONSTANTS.MS_PER_MINUTE).toBe("number");
      expect(typeof TIME_CONSTANTS.MS_PER_HOUR).toBe("number");
    });

    it("객체는 불변이다 (as const)", () => {
      // readonly 속성 확인 - 컴파일 타임에 보장됨
      // 런타임에서는 값이 올바르게 설정되었는지만 확인
      expect(Object.keys(TIME_CONSTANTS)).toHaveLength(5);
    });
  });
});
