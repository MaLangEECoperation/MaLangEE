import type { CompletePageContents } from "../model";

export const defaultCompleteContents: CompletePageContents = {
  loading: {
    title: "결과를 불러오고 있어요...",
  },

  main: {
    title: "오늘도 잘 말했어요!",
  },

  stats: {
    totalDuration: "총 대화 시간",
    userSpeakDuration: "내가 말한 시간",
  },

  timeFormat: {
    hours: "시간",
    minutes: "분",
    seconds: "초",
  },

  buttons: {
    goHome: "처음으로 돌아가기",
  },
};
