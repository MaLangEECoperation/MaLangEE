import type { DashboardPageContents } from "../model";

/**
 * DashboardPage 기본 콘텐츠 (한국어)
 * 서버 컴포넌트에서 이 객체를 props로 전달하거나,
 * 다국어 지원 시 다른 콘텐츠 객체로 대체
 */
export const defaultDashboardContents: DashboardPageContents = {
  pageTitle: "대시보드",

  profile: {
    editNicknameLabel: "닉네임 변경",
    logoutButton: "로그아웃",
    totalDurationLabel: "말랭이와 함께한 시간",
    userDurationLabel: "내가 말한 시간",
    newChatButton: "말랭이랑 새로운 대화를 해볼까요?",
    deleteAccountButton: "회원탈퇴",
  },

  history: {
    title: "대화 내역",
    dateHeader: "날짜",
    topicHeader: "주제",
    durationHeader: "말한시간 / 대화시간",
    emptyMessage: "말랭이와 대화한 이력이 없어요.",
    allLoadedMessage: "모든 데이터를 불러왔습니다",
  },

  timeFormat: {
    hours: "시간",
    minutes: "분",
    seconds: "초",
  },
};
