import type { VoiceSelectionPageContents } from "../model";

export const defaultVoiceSelectionContents: VoiceSelectionPageContents = {
  title: "말랭이 목소리 톤을 선택해 주세요.",

  prevVoiceLabel: "이전 목소리",
  nextVoiceLabel: "다음 목소리",

  preview: {
    playing: "재생 중...",
    default: "미리듣기",
  },

  startButton: "대화 시작하기",

  voiceOptions: [
    {
      id: "echo",
      name: "Echo",
      description: "차분하고 안정적인 남성 목소리",
      sampleUrl: "https://cdn.openai.com/API/docs/audio/echo.wav",
    },
    {
      id: "shimmer",
      name: "Shimmer",
      description: "따뜻하고 편안한 여성 목소리",
      sampleUrl: "https://cdn.openai.com/API/docs/audio/shimmer.wav",
    },
    {
      id: "alloy",
      name: "Alloy",
      description: "부드럽고 친근한 중성 목소리",
      sampleUrl: "https://cdn.openai.com/API/docs/audio/alloy.wav",
    },
    {
      id: "nova",
      name: "Nova",
      description: "명랑하고 활기찬 여성 목소리",
      sampleUrl: "https://cdn.openai.com/API/docs/audio/nova.wav",
    },
  ],
};
