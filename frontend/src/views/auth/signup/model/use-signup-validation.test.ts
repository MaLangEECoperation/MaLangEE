import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useSignupValidation } from "./use-signup-validation";

describe("useSignupValidation", () => {
  const defaultChecks = {
    loginIdCheck: { error: null, isAvailable: true },
    nicknameCheck: { error: null, isAvailable: true },
    passwordCheck: { error: null },
  };

  it("모든 검사가 통과하면 제출이 가능하다", () => {
    const { result } = renderHook(() => useSignupValidation(defaultChecks));

    expect(result.current.isSubmitDisabled).toBe(false);
    expect(result.current.validationError).toBeNull();
  });

  it("로그인 ID 오류가 있으면 제출이 불가능하다", () => {
    const { result } = renderHook(() =>
      useSignupValidation({
        ...defaultChecks,
        loginIdCheck: { error: "이미 사용 중인 아이디입니다", isAvailable: false },
      })
    );

    expect(result.current.isSubmitDisabled).toBe(true);
  });

  it("닉네임 오류가 있으면 제출이 불가능하다", () => {
    const { result } = renderHook(() =>
      useSignupValidation({
        ...defaultChecks,
        nicknameCheck: { error: "이미 사용 중인 닉네임입니다", isAvailable: false },
      })
    );

    expect(result.current.isSubmitDisabled).toBe(true);
  });

  it("비밀번호 오류가 있으면 제출이 불가능하다", () => {
    const { result } = renderHook(() =>
      useSignupValidation({
        ...defaultChecks,
        passwordCheck: { error: "비밀번호가 일치하지 않습니다" },
      })
    );

    expect(result.current.isSubmitDisabled).toBe(true);
  });

  it("validationError를 설정하고 초기화할 수 있다", () => {
    const { result } = renderHook(() => useSignupValidation(defaultChecks));

    expect(result.current.validationError).toBeNull();

    act(() => {
      result.current.setValidationError("서버 오류가 발생했습니다");
    });

    expect(result.current.validationError).toBe("서버 오류가 발생했습니다");

    act(() => {
      result.current.setValidationError(null);
    });

    expect(result.current.validationError).toBeNull();
  });
});
