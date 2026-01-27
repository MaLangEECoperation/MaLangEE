import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useMalangEEStatus } from "./use-malangee-status";

describe("useMalangEEStatus", () => {
  it("userTranscript에 [unintelligible]이 포함되면 sad를 반환한다", () => {
    const { result } = renderHook(() =>
      useMalangEEStatus({
        userTranscript: "Hello [unintelligible] world",
        showHintPrompt: false,
        isAiSpeaking: false,
      })
    );

    expect(result.current).toBe("sad");
  });

  it("showHintPrompt가 true면 humm을 반환한다", () => {
    const { result } = renderHook(() =>
      useMalangEEStatus({
        userTranscript: null,
        showHintPrompt: true,
        isAiSpeaking: false,
      })
    );

    expect(result.current).toBe("humm");
  });

  it("isAiSpeaking이 true면 talking을 반환한다", () => {
    const { result } = renderHook(() =>
      useMalangEEStatus({
        userTranscript: null,
        showHintPrompt: false,
        isAiSpeaking: true,
      })
    );

    expect(result.current).toBe("talking");
  });

  it("특별한 조건이 없으면 default를 반환한다", () => {
    const { result } = renderHook(() =>
      useMalangEEStatus({
        userTranscript: "Hello world",
        showHintPrompt: false,
        isAiSpeaking: false,
      })
    );

    expect(result.current).toBe("default");
  });

  it("우선순위: sad > humm > talking > default", () => {
    // sad가 가장 우선
    const { result: result1 } = renderHook(() =>
      useMalangEEStatus({
        userTranscript: "[unintelligible]",
        showHintPrompt: true,
        isAiSpeaking: true,
      })
    );
    expect(result1.current).toBe("sad");

    // humm이 talking보다 우선
    const { result: result2 } = renderHook(() =>
      useMalangEEStatus({
        userTranscript: null,
        showHintPrompt: true,
        isAiSpeaking: true,
      })
    );
    expect(result2.current).toBe("humm");
  });
});
