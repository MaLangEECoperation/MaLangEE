import type { ConversationPageContents } from "../model";

export const defaultConversationContents: ConversationPageContents = {
  messages: {
    connectionError: {
      title: "연결에 문제가 있어요",
      description: "잠시 후 다시 시도해주세요",
    },
    unintelligible: {
      title: "말랭이가 이해하지 못했어요.",
      description: "한번만 다시 말씀해 주세요.",
    },
    waitingForAnswer: {
      title: "말랭이가 대답을 기다리고 있어요.",
      description: "Cheer up!",
    },
    aiSpeaking: {
      defaultTitle: "말랭이가 말하고 있어요",
    },
    listening: {
      defaultTitle: "편하게 말해보세요",
      defaultDescription: "말랭이가 듣고 있어요",
    },
    connecting: {
      title: "말랭이와 연결하고 있어요",
      description: "잠시만 기다려주세요",
    },
    preparing: {
      title: "잠시만 기다려주세요",
    },
  },

  errors: {
    microphoneError: "마이크를 시작할 수 없습니다.",
    textInputNotReady: "텍스트 입력 기능은 준비 중입니다.",
  },

  sessionError: {
    title: "세션을 찾을 수 없어요",
    description: "주제를 먼저 선택해주세요",
    buttonText: "주제 선택하기",
  },

  loginPrompt: {
    message: "로그인을 하면 대화를 저장하고\n이어 말할 수 있어요",
    confirmText: "로그인하기",
    cancelText: "회원가입",
  },

  waitPopup: {
    message: "대화가 잠시 멈췄어요.\n계속 이야기 할까요?",
    confirmText: "이어 말하기",
    cancelText: "대화 그만하기",
  },
};
