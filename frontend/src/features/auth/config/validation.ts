/**
 * 인증 관련 검증 상수
 *
 * @description 로그인ID, 닉네임, 비밀번호 등 인증 필드의 검증 규칙을 정의합니다.
 *
 * @example
 * ```typescript
 * // 닉네임 검증
 * if (nickname.length < AUTH_VALIDATION.NICKNAME.MIN_LENGTH) {
 *   return "닉네임이 너무 짧습니다";
 * }
 *
 * // 디바운스 적용
 * const debouncedCheck = useDebouncedCallback(
 *   checkAvailability,
 *   AUTH_VALIDATION.LOGIN_ID.DEBOUNCE_MS
 * );
 * ```
 */
export const AUTH_VALIDATION = {
  /** 로그인 ID 검증 규칙 */
  LOGIN_ID: {
    /** 최소 길이 (4자) */
    MIN_LENGTH: 4,
    /** 중복 확인 디바운스 시간 (1000ms) */
    DEBOUNCE_MS: 1000,
  },

  /** 닉네임 검증 규칙 */
  NICKNAME: {
    /** 최소 길이 (2자) */
    MIN_LENGTH: 2,
    /** 최대 길이 (6자) */
    MAX_LENGTH: 6,
    /** 중복 확인 디바운스 시간 (1000ms) */
    DEBOUNCE_MS: 1000,
  },

  /** 비밀번호 검증 규칙 */
  PASSWORD: {
    /** 최소 길이 (1자) */
    MIN_LENGTH: 1,
    /** 유효성 검사 디바운스 시간 (300ms) */
    DEBOUNCE_MS: 300,
  },

  /** 토큰 관련 설정 */
  TOKEN: {
    /** 토큰 유효성 체크 간격 (5분 = 300000ms) */
    CHECK_INTERVAL_MS: 5 * 60 * 1000,
  },
} as const;

/** AUTH_VALIDATION 타입 */
export type AuthValidation = typeof AUTH_VALIDATION;
