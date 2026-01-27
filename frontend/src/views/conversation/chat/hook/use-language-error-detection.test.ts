import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useLanguageErrorDetection } from "./use-language-error-detection";

describe("useLanguageErrorDetection", () => {
  it("userTranscript에 [unintelligible]이 포함되면 showLanguageError가 true가 된다", () => {
    const { result } = renderHook(() =>
      useLanguageErrorDetection({
        userTranscript: "Hello [unintelligible] world",
      })
    );

    expect(result.current.showLanguageError).toBe(true);
  });

  it("userTranscript에 [unintelligible]이 없으면 showLanguageError가 false이다", () => {
    const { result } = renderHook(() =>
      useLanguageErrorDetection({
        userTranscript: "Hello world",
      })
    );

    expect(result.current.showLanguageError).toBe(false);
  });

  it("userTranscript가 null이면 showLanguageError가 false이다", () => {
    const { result } = renderHook(() =>
      useLanguageErrorDetection({
        userTranscript: null,
      })
    );

    expect(result.current.showLanguageError).toBe(false);
  });

  it("dismissError 호출 시 showLanguageError가 false가 된다", () => {
    const { result } = renderHook(() =>
      useLanguageErrorDetection({
        userTranscript: "[unintelligible]",
      })
    );

    expect(result.current.showLanguageError).toBe(true);

    act(() => {
      result.current.dismissError();
    });

    expect(result.current.showLanguageError).toBe(false);
  });
});
