import type { WelcomeBackPageContents } from "../model";

export const defaultWelcomeBackContents: WelcomeBackPageContents = {
  loading: {
    title: "잠시만 기다려주세요...",
  },

  welcome: {
    greeting: "기다리고 있었어요!",
    continuation: "지난번에 했던 {title},",
    question: "이 주제로 다시 이야기해볼까요?",
    defaultTitle: "이전 대화",
  },

  buttons: {
    startChat: "대화 시작하기",
    newTopic: "새로운 주제 고르기",
  },
};
