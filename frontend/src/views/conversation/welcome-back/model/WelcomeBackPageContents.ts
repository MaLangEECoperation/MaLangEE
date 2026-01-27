export interface WelcomeBackPageContents {
  /** 로딩 메시지 */
  loading: {
    title: string;
  };

  /** 환영 메시지 */
  welcome: {
    greeting: string;
    continuation: string;
    question: string;
    defaultTitle: string;
  };

  /** 버튼 */
  buttons: {
    startChat: string;
    newTopic: string;
  };
}
