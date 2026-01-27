import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useConversationMessage } from "./use-conversation-message";

describe("useConversationMessage", () => {
  const defaultContents = {
    connecting: {
      title: "연결 중",
      description: "잠시만 기다려주세요",
    },
    disconnected: {
      title: "연결 끊김",
      description: "다시 연결 중입니다",
    },
    readyToSpeak: {
      title: "준비됨",
      description: "말해보세요",
    },
    speaking: {
      title: "듣고 있어요",
      description: "",
    },
    hintPrompt: {
      title: "힌트",
      description: "도움이 필요하신가요?",
    },
  };

  const defaultOptions = {
    isConnected: true,
    wasConnected: true,
    isAiSpeaking: false,
    isUserSpeaking: false,
    isReady: true,
    userTranscript: null,
    aiMessage: null,
    aiMessageKR: null,
    showHintPrompt: false,
    showSubtitle: true,
    contents: defaultContents,
  };

  it("연결 전이면 connecting 메시지를 반환한다", () => {
    const { result } = renderHook(() =>
      useConversationMessage({
        ...defaultOptions,
        isConnected: false,
        wasConnected: false,
      })
    );

    expect(result.current.title).toBe("연결 중");
    expect(result.current.description).toBe("잠시만 기다려주세요");
  });

  it("연결이 끊기면 disconnected 메시지를 반환한다", () => {
    const { result } = renderHook(() =>
      useConversationMessage({
        ...defaultOptions,
        isConnected: false,
        wasConnected: true,
      })
    );

    expect(result.current.title).toBe("연결 끊김");
    expect(result.current.description).toBe("다시 연결 중입니다");
  });

  it("AI가 말할 때 AI 메시지를 표시한다", () => {
    const { result } = renderHook(() =>
      useConversationMessage({
        ...defaultOptions,
        isAiSpeaking: true,
        aiMessage: "Hello there!",
        aiMessageKR: "안녕하세요!",
      })
    );

    expect(result.current.title).toBe("Hello there!");
    expect(result.current.description).toBe("안녕하세요!");
  });

  it("자막 비활성화 시 한국어 번역을 숨긴다", () => {
    const { result } = renderHook(() =>
      useConversationMessage({
        ...defaultOptions,
        isAiSpeaking: true,
        aiMessage: "Hello there!",
        aiMessageKR: "안녕하세요!",
        showSubtitle: false,
      })
    );

    expect(result.current.title).toBe("Hello there!");
    expect(result.current.description).toBe("");
  });

  it("사용자가 말할 때 userTranscript를 표시한다", () => {
    const { result } = renderHook(() =>
      useConversationMessage({
        ...defaultOptions,
        isUserSpeaking: true,
        userTranscript: "I am speaking",
      })
    );

    expect(result.current.title).toBe("듣고 있어요");
    expect(result.current.description).toBe("I am speaking");
  });

  it("힌트 프롬프트가 표시되면 힌트 메시지를 반환한다", () => {
    const { result } = renderHook(() =>
      useConversationMessage({
        ...defaultOptions,
        showHintPrompt: true,
      })
    );

    expect(result.current.title).toBe("힌트");
    expect(result.current.description).toBe("도움이 필요하신가요?");
  });

  it("대기 상태에서는 readyToSpeak 메시지를 반환한다", () => {
    const { result } = renderHook(() =>
      useConversationMessage({
        ...defaultOptions,
        isReady: true,
      })
    );

    expect(result.current.title).toBe("준비됨");
    expect(result.current.description).toBe("말해보세요");
  });
});
