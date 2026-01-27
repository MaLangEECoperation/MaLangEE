import { useState, useMemo } from "react";

interface CheckResult {
  error: string | null;
  isAvailable?: boolean;
}

interface UseSignupValidationOptions {
  /** 로그인 ID 중복 체크 결과 */
  loginIdCheck: CheckResult & { isAvailable: boolean };
  /** 닉네임 중복 체크 결과 */
  nicknameCheck: CheckResult & { isAvailable: boolean };
  /** 비밀번호 확인 체크 결과 */
  passwordCheck: CheckResult;
}

interface UseSignupValidationReturn {
  /** 유효성 검사 오류 메시지 */
  validationError: string | null;
  /** 유효성 검사 오류 설정 */
  setValidationError: (error: string | null) => void;
  /** 제출 버튼 비활성화 여부 */
  isSubmitDisabled: boolean;
}

/**
 * 회원가입 폼 유효성 검사 상태를 관리하는 훅
 *
 * @param options - 각 필드별 검사 결과
 * @returns { validationError, setValidationError, isSubmitDisabled }
 *
 * @example
 * ```tsx
 * const { validationError, setValidationError, isSubmitDisabled } = useSignupValidation({
 *   loginIdCheck: { error: null, isAvailable: true },
 *   nicknameCheck: { error: null, isAvailable: true },
 *   passwordCheck: { error: null },
 * });
 *
 * <Button disabled={isSubmitDisabled}>가입하기</Button>
 * ```
 */
export function useSignupValidation(
  options: UseSignupValidationOptions
): UseSignupValidationReturn {
  const { loginIdCheck, nicknameCheck, passwordCheck } = options;

  const [validationError, setValidationError] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    // 로그인 ID 오류 또는 사용 불가
    if (loginIdCheck.error || !loginIdCheck.isAvailable) {
      return true;
    }

    // 닉네임 오류 또는 사용 불가
    if (nicknameCheck.error || !nicknameCheck.isAvailable) {
      return true;
    }

    // 비밀번호 확인 오류
    if (passwordCheck.error) {
      return true;
    }

    return false;
  }, [loginIdCheck, nicknameCheck, passwordCheck]);

  return {
    validationError,
    setValidationError,
    isSubmitDisabled,
  };
}
