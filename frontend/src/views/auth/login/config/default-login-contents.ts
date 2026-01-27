import type { LoginPageContents } from "../model";

export const defaultLoginContents: LoginPageContents = {
  titleMessages: [
    {
      top: "Talk like there",
      headingLine1: "그 상황에",
      headingLine2: "있는 것처럼 말해요",
    },
    {
      top: "Need help? Get hints",
      headingLine1: "막히면",
      headingLine2: "말랭이가 힌트를 줘요",
    },
    {
      top: "Your pace, your talk",
      headingLine1: "말랭이가",
      headingLine2: "내 템포에 맞춰줘요",
    },
  ],

  greeting: {
    line1: "Hello,",
    line2: "I'm MalangEE",
  },

  form: {
    emailPlaceholder: "이메일",
    passwordPlaceholder: "비밀번호",
    findCredentials: "이메일/비밀번호 찾기",
    signupLink: "회원가입",
    loginError: "로그인에 실패했습니다",
    loginButton: "로그인",
    loginPending: "로그인 중..",
    tryNowButton: "바로 체험해보기",
  },

  comingSoon: {
    title: "준비중입니다",
    description: "해당 기능은 현재 준비중입니다.\n조금만 기다려주세요!",
    confirmButton: "확인",
  },
};
