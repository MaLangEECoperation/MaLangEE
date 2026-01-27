export interface CompletePageContents {
  /** 로딩 메시지 */
  loading: {
    title: string;
  };

  /** 메인 메시지 */
  main: {
    title: string;
  };

  /** 통계 레이블 */
  stats: {
    totalDuration: string;
    userSpeakDuration: string;
  };

  /** 시간 형식 */
  timeFormat: {
    hours: string;
    minutes: string;
    seconds: string;
  };

  /** 버튼 */
  buttons: {
    goHome: string;
  };
}
