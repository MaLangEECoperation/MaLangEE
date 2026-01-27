export interface DirectSpeechPageContents {
  /** 힌트 메시지 */
  hintMessage: string;

  /** 상태별 메시지 */
  messages: {
    /** 연결 문제 */
    connectionError: {
      title: string;
      description: string;
    };
    /** 비활성 상태 */
    inactivity: {
      title: string;
      description: string;
    };
    /** 이해 못함 */
    notUnderstood: {
      title: string;
      description: string;
    };
    /** AI 말하는 중 기본 */
    aiSpeaking: {
      defaultTitle: string;
      defaultDescription: string;
    };
    /** 듣는 중 기본 */
    listening: {
      defaultTitle: string;
      defaultDescription: string;
    };
    /** 연결 중 */
    connecting: {
      title: string;
      description: string;
    };
    /** 준비 중 */
    preparing: {
      title: string;
      description: string;
    };
  };
}
