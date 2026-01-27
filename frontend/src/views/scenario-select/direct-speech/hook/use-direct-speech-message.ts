import { useMemo } from "react";

interface DirectSpeechContents {
  initial: { title: string; description: string };
  connecting: { title: string; description: string };
  disconnected: { title: string; description: string };
  listening: { title: string; description: string };
  inactivity: { title: string; description: string };
  notUnderstood: { title: string; description: string };
}

interface UseDirectSpeechMessageOptions {
  /** 대화 시작 여부 */
  hasStarted: boolean;
  /** WebSocket 연결 상태 */
  isConnected: boolean;
  /** 이전에 연결된 적이 있는지 */
  wasConnected: boolean;
  /** AI가 말하고 있는지 */
  isAiSpeaking: boolean;
  /** 사용자 음성 듣기 모드 */
  isListening: boolean;
  /** 비활성화 메시지 표시 */
  showInactivityMessage: boolean;
  /** 인식 불가 메시지 표시 */
  showNotUnderstood: boolean;
  /** AI 메시지 (영어) */
  aiMessage: string | null;
  /** AI 메시지 (한국어 번역) */
  aiMessageKR: string | null;
  /** 콘텐츠 텍스트 */
  contents: DirectSpeechContents;
}

interface MessageState {
  title: string;
  description: string;
}

/**
 * 직접 발화 페이지 상태에 따른 메시지를 결정하는 훅
 *
 * @param options - 발화 상태 옵션
 * @returns MessageState
 *
 * @example
 * ```tsx
 * const message = useDirectSpeechMessage({
 *   hasStarted: true,
 *   isConnected: true,
 *   wasConnected: true,
 *   isAiSpeaking: false,
 *   isListening: true,
 *   showInactivityMessage: false,
 *   showNotUnderstood: false,
 *   aiMessage: null,
 *   aiMessageKR: null,
 *   contents: directSpeechContents,
 * });
 *
 * <MessageDisplay title={message.title} description={message.description} />
 * ```
 */
export function useDirectSpeechMessage(options: UseDirectSpeechMessageOptions): MessageState {
  const {
    hasStarted,
    isConnected,
    wasConnected,
    isAiSpeaking,
    isListening,
    showInactivityMessage,
    showNotUnderstood,
    aiMessage,
    aiMessageKR,
    contents,
  } = options;

  return useMemo(() => {
    // 1. 시작 전 상태
    if (!hasStarted) {
      return {
        title: contents.initial.title,
        description: contents.initial.description,
      };
    }

    // 2. 연결 중 상태
    if (!isConnected && !wasConnected) {
      return {
        title: contents.connecting.title,
        description: contents.connecting.description,
      };
    }

    // 3. 연결 끊김 상태
    if (!isConnected && wasConnected) {
      return {
        title: contents.disconnected.title,
        description: contents.disconnected.description,
      };
    }

    // 4. AI가 말하고 있을 때
    if (isAiSpeaking && aiMessage) {
      return {
        title: aiMessage,
        description: aiMessageKR || "",
      };
    }

    // 5. 비활성화 메시지
    if (showInactivityMessage) {
      return {
        title: contents.inactivity.title,
        description: contents.inactivity.description,
      };
    }

    // 6. 인식 불가 메시지
    if (showNotUnderstood) {
      return {
        title: contents.notUnderstood.title,
        description: contents.notUnderstood.description,
      };
    }

    // 7. 듣기 모드
    if (isListening) {
      return {
        title: contents.listening.title,
        description: contents.listening.description,
      };
    }

    // 기본값
    return {
      title: contents.connecting.title,
      description: contents.connecting.description,
    };
  }, [
    hasStarted,
    isConnected,
    wasConnected,
    isAiSpeaking,
    isListening,
    showInactivityMessage,
    showNotUnderstood,
    aiMessage,
    aiMessageKR,
    contents,
  ]);
}
