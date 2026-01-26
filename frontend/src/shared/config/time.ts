/**
 * 시간 단위 변환 상수
 *
 * @description 시간 계산에 사용되는 상수들을 정의합니다.
 * 매직넘버를 제거하고 코드 가독성을 향상시킵니다.
 *
 * @example
 * ```typescript
 * // 초를 시간으로 변환
 * const hours = Math.floor(seconds / TIME_CONSTANTS.SECONDS_PER_HOUR);
 *
 * // 밀리초를 분으로 변환
 * const minutes = Math.floor(ms / TIME_CONSTANTS.MS_PER_MINUTE);
 * ```
 */
export const TIME_CONSTANTS = {
  /** 1분 = 60초 */
  SECONDS_PER_MINUTE: 60,

  /** 1시간 = 3600초 */
  SECONDS_PER_HOUR: 3600,

  /** 1초 = 1000ms */
  MS_PER_SECOND: 1000,

  /** 1분 = 60000ms */
  MS_PER_MINUTE: 60_000,

  /** 1시간 = 3600000ms */
  MS_PER_HOUR: 3_600_000,
} as const;

/** TIME_CONSTANTS 타입 */
export type TimeConstants = typeof TIME_CONSTANTS;
