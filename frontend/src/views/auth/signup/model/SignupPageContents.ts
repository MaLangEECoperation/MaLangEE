/**
 * SignupPage 정적 텍스트/다국어 콘텐츠 인터페이스
 */
export interface SignupPageContents {
  /** 페이지 제목 */
  pageTitle: string;

  /** 폼 필드 */
  form: {
    email: {
      label: string;
      placeholder: string;
      availableMessage: string;
    };
    password: {
      label: string;
      placeholder: string;
      availableMessage: string;
    };
    nickname: {
      label: string;
      placeholder: string;
      availableMessage: string;
    };
  };

  /** 버튼/링크 */
  actions: {
    submitButton: string;
    submitPending: string;
    hasAccount: string;
    loginLink: string;
  };

  /** 성공 다이얼로그 */
  successDialog: {
    title: string;
    loginButton: string;
  };

  /** 에러 메시지 */
  errors: {
    networkError: string;
    signupFailed: string;
  };
}
