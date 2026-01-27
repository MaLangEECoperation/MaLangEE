import type { SignupPageContents } from "../model";

export const defaultSignupContents: SignupPageContents = {
  pageTitle: "회원가입",

  form: {
    email: {
      label: "이메일",
      placeholder: "이메일을 입력해주세요",
      availableMessage: "사용 가능한 이메일입니다",
    },
    password: {
      label: "비밀번호",
      placeholder: "비밀번호 (영문+숫자 10자리 이상)",
      availableMessage: "사용 가능한 비밀번호입니다",
    },
    nickname: {
      label: "닉네임",
      placeholder: "닉네임",
      availableMessage: "사용 가능한 닉네임입니다",
    },
  },

  actions: {
    submitButton: "회원가입",
    submitPending: "가입 중...",
    hasAccount: "이미 계정이 있으신가요?",
    loginLink: "로그인",
  },

  successDialog: {
    title: "회원이 된걸 축하해요!",
    loginButton: "로그인하기",
  },

  errors: {
    networkError: "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.",
    signupFailed: "회원가입에 실패했습니다. 입력 정보를 확인해주세요.",
  },
};
