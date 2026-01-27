import type { DirectSpeechPageContents } from "../model";

export const defaultDirectSpeechContents: DirectSpeechPageContents = {
  hintMessage: "예: 공항 체크인 상황을 연습하고 싶어요.",

  messages: {
    connectionError: {
      title: "연결에 문제가 있어요",
      description: "잠시 후 다시 시도해주세요",
    },
    inactivity: {
      title: "말랭이가 대답을 기다리고 있어요",
      description: "Cheer up!",
    },
    notUnderstood: {
      title: "말랭이가 잘 이해하지 못했어요",
      description: "다시 한번 말씀해 주시겠어요?",
    },
    aiSpeaking: {
      defaultTitle: "말랭이가 질문하고 있어요",
      defaultDescription: "잘 들어보세요",
    },
    listening: {
      defaultTitle: "말랭이가 듣고 있어요",
      defaultDescription: "편하게 말해보세요",
    },
    connecting: {
      title: "말랭이와 연결하고 있어요",
      description: "잠시만 기다려주세요",
    },
    preparing: {
      title: "잠시만 기다려주세요",
      description: "말랭이가 준비하고 있어요",
    },
  },
};
