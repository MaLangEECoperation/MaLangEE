import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useFormatDuration } from "./use-format-duration";

describe("useFormatDuration", () => {
  const format = {
    hours: "시간",
    minutes: "분",
    seconds: "초",
  };

  it("0초를 올바르게 포맷한다", () => {
    const { result } = renderHook(() => useFormatDuration(format));

    expect(result.current(0)).toBe("00분 00초");
  });

  it("분과 초를 올바르게 포맷한다", () => {
    const { result } = renderHook(() => useFormatDuration(format));

    expect(result.current(125)).toBe("02분 05초"); // 2분 5초
  });

  it("시간이 포함된 경우 올바르게 포맷한다", () => {
    const { result } = renderHook(() => useFormatDuration(format));

    expect(result.current(3725)).toBe("01시간 02분 05초"); // 1시간 2분 5초
  });

  it("영어 포맷도 지원한다", () => {
    const englishFormat = {
      hours: "h",
      minutes: "m",
      seconds: "s",
    };

    const { result } = renderHook(() => useFormatDuration(englishFormat));

    expect(result.current(3725)).toBe("01h 02m 05s");
  });
});
