/**
 * API 설정 및 에러 클래스
 */

/** 백엔드 API 기본 URL (서버 사이드용) */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://49.50.137.35:8080";

/** API 기본 경로 */
export const API_BASE_PATH = "/api/v1";

/**
 * 완전한 API URL을 반환합니다.
 * 클라이언트 사이드에서는 상대 경로(/api/v1)를 사용하여 Mixed Content 에러를 방지합니다.
 * Next.js rewrites가 이 요청을 실제 백엔드로 전달합니다.
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return API_BASE_PATH;
  }
  return `${API_BASE_URL}${API_BASE_PATH}`;
}

/**
 * API 에러 클래스
 * HTTP 에러 응답을 구조화된 에러 객체로 변환합니다.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      status: this.status,
      message: this.message,
      details: this.details,
    };
  }
}
