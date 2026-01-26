import { describe, it, expect } from "vitest";

import { BREAKPOINTS, TOUCH_TARGET, RESPONSIVE_SPACING } from "./breakpoints";

describe("Breakpoints", () => {
  describe("BREAKPOINTS", () => {
    it("should have standard Tailwind breakpoint values", () => {
      expect(BREAKPOINTS.SM).toBe(640);
      expect(BREAKPOINTS.MD).toBe(768);
      expect(BREAKPOINTS.LG).toBe(1024);
      expect(BREAKPOINTS.XL).toBe(1280);
      expect(BREAKPOINTS["2XL"]).toBe(1536);
    });

    it("should have breakpoints in ascending order", () => {
      expect(BREAKPOINTS.SM).toBeLessThan(BREAKPOINTS.MD);
      expect(BREAKPOINTS.MD).toBeLessThan(BREAKPOINTS.LG);
      expect(BREAKPOINTS.LG).toBeLessThan(BREAKPOINTS.XL);
      expect(BREAKPOINTS.XL).toBeLessThan(BREAKPOINTS["2XL"]);
    });
  });

  describe("TOUCH_TARGET", () => {
    it("should have minimum size of 44px (WCAG 2.1 AAA)", () => {
      expect(TOUCH_TARGET.MIN_SIZE).toBe(44);
    });

    it("should have recommended size of 48px (Material Design)", () => {
      expect(TOUCH_TARGET.RECOMMENDED_SIZE).toBe(48);
    });

    it("should have recommended size greater than or equal to minimum", () => {
      expect(TOUCH_TARGET.RECOMMENDED_SIZE).toBeGreaterThanOrEqual(TOUCH_TARGET.MIN_SIZE);
    });
  });

  describe("RESPONSIVE_SPACING", () => {
    it("should have mobile page padding of 16px (p-4)", () => {
      expect(RESPONSIVE_SPACING.MOBILE_PAGE_PADDING).toBe(16);
    });

    it("should have desktop page padding of 40px (p-10)", () => {
      expect(RESPONSIVE_SPACING.DESKTOP_PAGE_PADDING).toBe(40);
    });

    it("should have desktop padding greater than mobile", () => {
      expect(RESPONSIVE_SPACING.DESKTOP_PAGE_PADDING).toBeGreaterThan(
        RESPONSIVE_SPACING.MOBILE_PAGE_PADDING
      );
    });

    it("should have desktop gap greater than mobile gap", () => {
      expect(RESPONSIVE_SPACING.DESKTOP_GAP).toBeGreaterThan(RESPONSIVE_SPACING.MOBILE_GAP);
    });
  });
});
