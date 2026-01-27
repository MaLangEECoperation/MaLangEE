import { useMemo } from "react";

interface ConversationContents {
  connecting: { title: string; description: string };
  disconnected: { title: string; description: string };
  readyToSpeak: { title: string; description: string };
  speaking: { title: string; description: string };
  hintPrompt: { title: string; description: string };
}

interface UseConversationMessageOptions {
  /** WebSocket 연결 상태 */
  isConnected: boolean;
  /** 이전에 연결된 적이 있는지 */
  wasConnected: boolean;
  /** AI가 말하고 있는지 */
  isAiSpeaking: boolean;
  /** 사용자가 말하고 있는지 */
  isUserSpeaking: boolean;
  /** 대화 준비 완료 상태 */
  isReady: boolean;
  /** 사용자 발화 텍스트 */
  userTranscript: string | null;
  /** AI 메시지 (영어) */
  aiMessage: string | null;
  /** AI 메시지 (한국어 번역) */
  aiMessageKR: string | null;
  /** 힌트 프롬프트 표시 여부 */
  showHintPrompt: boolean;
  /** 자막 표시 여부 */
  showSubtitle: boolean;
  /** 콘텐츠 텍스트 */
  contents: ConversationContents;
}

interface MessageState {
  title: string;
  description: string;
}

/**
 * 대화 상태에 따른 메시지를 결정하는 훅
 *
 * @param options - 대화 상태 옵션
 * @returns MessageState
 *
 * @example
 * ```tsx
 * const message = useConversationMessage({
 *   isConnected: true,
 *   wasConnected: true,
 *   isAiSpeaking: false,
 *   isUserSpeaking: true,
 *   isReady: true,
 *   userTranscript: "Hello",
 *   aiMessage: null,
 *   aiMessageKR: null,
 *   showHintPrompt: false,
 *   showSubtitle: true,
 *   contents: conversationContents,
 * });
 *
 * <MessageDisplay title={message.title} description={message.description} />
 * ```
 */
export function useConversationMessage(options: UseConversationMessageOptions): MessageState {
  const {
    isConnected,
    wasConnected,
    isAiSpeaking,
    isUserSpeaking,
    isReady,
    userTranscript,
    aiMessage,
    aiMessageKR,
    showHintPrompt,
    showSubtitle,
    contents,
  } = options;

  return useMemo(() => {
    // 1. 연결 전 상태
    if (!isConnected && !wasConnected) {
      return {
        title: contents.connecting.title,
        description: contents.connecting.description,
      };
    }

    // 2. 연결 끊김 상태
    if (!isConnected && wasConnected) {
      return {
        title: contents.disconnected.title,
        description: contents.disconnected.description,
      };
    }

    // 3. AI가 말하고 있을 때
    if (isAiSpeaking && aiMessage) {
      return {
        title: aiMessage,
        description: showSubtitle && aiMessageKR ? aiMessageKR : "",
      };
    }

    // 4. 사용자가 말하고 있을 때
    if (isUserSpeaking) {
      return {
        title: contents.speaking.title,
        description: userTranscript || "",
      };
    }

    // 5. 힌트 프롬프트 표시
    if (showHintPrompt) {
      return {
        title: contents.hintPrompt.title,
        description: contents.hintPrompt.description,
      };
    }

    // 6. 대기 상태
    if (isReady) {
      return {
        title: contents.readyToSpeak.title,
        description: contents.readyToSpeak.description,
      };
    }

    // 기본값
    return {
      title: contents.connecting.title,
      description: contents.connecting.description,
    };
  }, [
    isConnected,
    wasConnected,
    isAiSpeaking,
    isUserSpeaking,
    isReady,
    userTranscript,
    aiMessage,
    aiMessageKR,
    showHintPrompt,
    showSubtitle,
    contents,
  ]);
}
