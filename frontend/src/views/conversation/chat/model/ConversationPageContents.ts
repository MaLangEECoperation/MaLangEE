export interface ConversationPageContents {
  /** 상태별 메시지 */
  messages: {
    connectionError: {
      title: string;
      description: string;
    };
    unintelligible: {
      title: string;
      description: string;
    };
    waitingForAnswer: {
      title: string;
      description: string;
    };
    aiSpeaking: {
      defaultTitle: string;
    };
    listening: {
      defaultTitle: string;
      defaultDescription: string;
    };
    connecting: {
      title: string;
      description: string;
    };
    preparing: {
      title: string;
    };
  };

  /** 마이크 에러 */
  errors: {
    microphoneError: string;
    textInputNotReady: string;
  };

  /** 세션 에러 팝업 */
  sessionError: {
    title: string;
    description: string;
    buttonText: string;
  };

  /** 로그인 팝업 */
  loginPrompt: {
    message: string;
    confirmText: string;
    cancelText: string;
  };

  /** 대기 팝업 */
  waitPopup: {
    message: string;
    confirmText: string;
    cancelText: string;
  };
}
