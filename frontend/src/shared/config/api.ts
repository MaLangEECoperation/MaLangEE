/**
 * API 관련 설정 상수
 * 환경 변수와 기본값을 관리합니다.
 */

/** 백엔드 API 기본 URL (서버 사이드용) */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://49.50.137.35:8080";

/** API 기본 경로 */
export const API_BASE_PATH = "/api/v1";

/**
 * 완전한 API URL을 반환합니다.
 * Mixed Content 에러 방지를 위해 클라이언트 사이드에서는 상대 경로(/api/v1)를 사용합니다.
 * Next.js의 rewrites 설정이 이 요청을 실제 백엔드(HTTP)로 전달합니다.
 */
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return API_BASE_PATH;
  }
  return `${API_BASE_URL}${API_BASE_PATH}`;
}
