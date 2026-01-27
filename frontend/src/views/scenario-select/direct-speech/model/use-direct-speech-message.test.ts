import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useDirectSpeechMessage } from "./use-direct-speech-message";

describe("useDirectSpeechMessage", () => {
  const defaultContents = {
    initial: {
      title: "시작하기",
      description: "아래 버튼을 눌러 시작하세요",
    },
    connecting: {
      title: "연결 중",
      description: "잠시만 기다려주세요",
    },
    disconnected: {
      title: "연결 끊김",
      description: "다시 연결합니다",
    },
    listening: {
      title: "듣고 있어요",
      description: "",
    },
    inactivity: {
      title: "잠깐!",
      description: "음성이 인식되지 않았어요",
    },
    notUnderstood: {
      title: "잠깐!",
      description: "말을 이해하지 못했어요",
    },
  };

  const defaultOptions = {
    hasStarted: true,
    isConnected: true,
    wasConnected: true,
    isAiSpeaking: false,
    isListening: false,
    showInactivityMessage: false,
    showNotUnderstood: false,
    aiMessage: null,
    aiMessageKR: null,
    contents: defaultContents,
  };

  it("시작 전에는 initial 메시지를 반환한다", () => {
    const { result } = renderHook(() =>
      useDirectSpeechMessage({
        ...defaultOptions,
        hasStarted: false,
      })
    );

    expect(result.current.title).toBe("시작하기");
    expect(result.current.description).toBe("아래 버튼을 눌러 시작하세요");
  });

  it("연결 중에는 connecting 메시지를 반환한다", () => {
    const { result } = renderHook(() =>
      useDirectSpeechMessage({
        ...defaultOptions,
        isConnected: false,
        wasConnected: false,
      })
    );

    expect(result.current.title).toBe("연결 중");
  });

  it("연결 끊김 시 disconnected 메시지를 반환한다", () => {
    const { result } = renderHook(() =>
      useDirectSpeechMessage({
        ...defaultOptions,
        isConnected: false,
        wasConnected: true,
      })
    );

    expect(result.current.title).toBe("연결 끊김");
  });

  it("AI가 말할 때 AI 메시지를 표시한다", () => {
    const { result } = renderHook(() =>
      useDirectSpeechMessage({
        ...defaultOptions,
        isAiSpeaking: true,
        aiMessage: "Hello!",
        aiMessageKR: "안녕하세요!",
      })
    );

    expect(result.current.title).toBe("Hello!");
    expect(result.current.description).toBe("안녕하세요!");
  });

  it("비활성화 메시지를 표시한다", () => {
    const { result } = renderHook(() =>
      useDirectSpeechMessage({
        ...defaultOptions,
        showInactivityMessage: true,
      })
    );

    expect(result.current.title).toBe("잠깐!");
    expect(result.current.description).toBe("음성이 인식되지 않았어요");
  });

  it("인식 불가 메시지를 표시한다", () => {
    const { result } = renderHook(() =>
      useDirectSpeechMessage({
        ...defaultOptions,
        showNotUnderstood: true,
      })
    );

    expect(result.current.title).toBe("잠깐!");
    expect(result.current.description).toBe("말을 이해하지 못했어요");
  });

  it("듣기 모드에서는 listening 메시지를 반환한다", () => {
    const { result } = renderHook(() =>
      useDirectSpeechMessage({
        ...defaultOptions,
        isListening: true,
      })
    );

    expect(result.current.title).toBe("듣고 있어요");
  });
});
