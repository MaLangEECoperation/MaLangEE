/**
 * LoginPage 정적 텍스트/다국어 콘텐츠 인터페이스
 */
export interface LoginPageContents {
  /** 타이틀 로테이션 메시지 */
  titleMessages: Array<{
    top: string;
    headingLine1: string;
    headingLine2: string;
  }>;

  /** 인사 섹션 */
  greeting: {
    line1: string;
    line2: string;
  };

  /** 폼 라벨/플레이스홀더 */
  form: {
    emailPlaceholder: string;
    passwordPlaceholder: string;
    findCredentials: string;
    signupLink: string;
    loginError: string;
    loginButton: string;
    loginPending: string;
    tryNowButton: string;
  };

  /** 준비중 모달 */
  comingSoon: {
    title: string;
    description: string;
    confirmButton: string;
  };
}
