import { describe, it, expect } from "vitest";

import {
  ARIA_ROLES,
  ARIA_LIVE,
  A11Y_CLASSES,
  SKIP_NAVIGATION,
  MIC_BUTTON_LABELS,
  LOADING_LABELS,
} from "./accessibility";

describe("Accessibility Constants", () => {
  describe("ARIA_ROLES", () => {
    it("should have standard ARIA role values", () => {
      expect(ARIA_ROLES.DIALOG).toBe("dialog");
      expect(ARIA_ROLES.ALERT).toBe("alert");
      expect(ARIA_ROLES.STATUS).toBe("status");
      expect(ARIA_ROLES.LOG).toBe("log");
      expect(ARIA_ROLES.SWITCH).toBe("switch");
      expect(ARIA_ROLES.REGION).toBe("region");
    });
  });

  describe("ARIA_LIVE", () => {
    it("should have valid aria-live values", () => {
      expect(ARIA_LIVE.POLITE).toBe("polite");
      expect(ARIA_LIVE.ASSERTIVE).toBe("assertive");
      expect(ARIA_LIVE.OFF).toBe("off");
    });
  });

  describe("A11Y_CLASSES", () => {
    it("should have sr-only class for screen reader only content", () => {
      expect(A11Y_CLASSES.SR_ONLY).toBe("sr-only");
    });

    it("should have focus-visible-only class with proper Tailwind classes", () => {
      expect(A11Y_CLASSES.FOCUS_VISIBLE_ONLY).toContain("sr-only");
      expect(A11Y_CLASSES.FOCUS_VISIBLE_ONLY).toContain("focus:not-sr-only");
      expect(A11Y_CLASSES.FOCUS_VISIBLE_ONLY).toContain("focus:absolute");
      expect(A11Y_CLASSES.FOCUS_VISIBLE_ONLY).toContain("focus:z-50");
    });

    it("should have focus ring class", () => {
      expect(A11Y_CLASSES.FOCUS_RING).toContain("focus-visible:ring-2");
    });
  });

  describe("SKIP_NAVIGATION", () => {
    it("should have main content ID", () => {
      expect(SKIP_NAVIGATION.MAIN_CONTENT_ID).toBe("main-content");
    });

    it("should have Korean skip link text", () => {
      expect(SKIP_NAVIGATION.SKIP_TO_MAIN).toBe("메인 콘텐츠로 건너뛰기");
    });
  });

  describe("MIC_BUTTON_LABELS", () => {
    it("should have Korean labels for all states", () => {
      expect(MIC_BUTTON_LABELS.IDLE).toBe("녹음 시작");
      expect(MIC_BUTTON_LABELS.LISTENING).toBe("녹음 중지");
      expect(MIC_BUTTON_LABELS.MUTED).toBe("음소거됨");
    });
  });

  describe("LOADING_LABELS", () => {
    it("should have Korean loading labels", () => {
      expect(LOADING_LABELS.DEFAULT).toBe("로딩 중");
      expect(LOADING_LABELS.FETCHING).toBe("데이터를 불러오는 중");
      expect(LOADING_LABELS.SAVING).toBe("저장 중");
    });
  });
});
