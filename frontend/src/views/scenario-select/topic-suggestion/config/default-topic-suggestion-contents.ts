import type { TopicSuggestionPageContents } from "../model";

export const defaultTopicSuggestionContents: TopicSuggestionPageContents = {
  main: {
    title: "이런 주제는 어때요?",
    description: "요즘 인기 있는 주제들 중에서 골라볼까요?",
    showMoreButton: "다른 주제 더보기",
    directSpeechButton: "직접 말하기",
  },

  loading: {
    title: "주제를 불러오는 중...",
    description: "잠시만 기다려주세요",
  },

  error: {
    title: "주제를 불러올 수 없어요",
    description: "잠시 후 다시 시도해주세요",
  },

  detailPopup: {
    placeLabel: "장소:",
    partnerLabel: "상대:",
    goalLabel: "목표:",
    settingsTitle: "대화 설정",
    subtitleToggleLabel: "자막 표시",
    voiceToneLabel: "목소리 톤",
    startButton: "이 주제로 시작하기",
  },

  voiceOptions: [
    { id: "echo", name: "Echo", description: "차분하고 안정적인 남성 목소리" },
    { id: "shimmer", name: "Shimmer", description: "따뜻하고 편안한 여성 목소리" },
    { id: "alloy", name: "Alloy", description: "부드럽고 친근한 중성 목소리" },
    { id: "nova", name: "Nova", description: "명랑하고 활기찬 여성 목소리" },
  ],

  errors: {
    sessionCreateFailed: "세션 생성에 실패했습니다. 다시 시도해주세요.",
  },
};
