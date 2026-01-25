/**
 * DashboardPage 정적 텍스트/다국어 콘텐츠 인터페이스
 * 서버 컴포넌트에서 주입하여 views에서 사용
 */
export interface DashboardPageContents {
  /** 페이지 제목 */
  pageTitle: string;

  /** 사용자 프로필 섹션 */
  profile: {
    /** 닉네임 변경 버튼 접근성 라벨 */
    editNicknameLabel: string;
    /** 로그아웃 버튼 텍스트 */
    logoutButton: string;
    /** "말랭이와 함께한 시간" 라벨 */
    totalDurationLabel: string;
    /** "내가 말한 시간" 라벨 */
    userDurationLabel: string;
    /** 새 대화 시작 버튼 텍스트 */
    newChatButton: string;
    /** 회원탈퇴 버튼 텍스트 */
    deleteAccountButton: string;
  };

  /** 대화 내역 섹션 */
  history: {
    /** 섹션 제목 */
    title: string;
    /** 테이블 헤더: 날짜 */
    dateHeader: string;
    /** 테이블 헤더: 주제 */
    topicHeader: string;
    /** 테이블 헤더: 시간 */
    durationHeader: string;
    /** 대화 기록 없음 메시지 */
    emptyMessage: string;
    /** 모두 불러옴 메시지 */
    allLoadedMessage: string;
  };

  /** 시간 포맷 */
  timeFormat: {
    /** 시간 단위 */
    hours: string;
    /** 분 단위 */
    minutes: string;
    /** 초 단위 */
    seconds: string;
  };
}
