/**
 * 애플리케이션 공통 설정
 * 환경 변수와 기본값을 관리하는 파일
 */

export const config = {
  // 로컬호스트 URL (개발 환경용)
  localhostUrl: process.env.NEXT_PUBLIC_LOCALHOST_URL,

  // 백엔드 API 기본 URL
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://49.50.137.35:8080',

  // API 기본 경로
  apiBasePath: "/api/v1",

  // 완전한 API URL (baseUrl + basePath)
  // 개발 환경에서는 Next.js proxy 사용하여 CORS 문제 해결
  get apiUrl(): string {
    if (process.env.NODE_ENV === 'development') {
      return this.apiBasePath; // /api/v1 (Next.js proxy 사용)
    }
    return `${this.apiBaseUrl}${this.apiBasePath}`;
  },
} as const;

export type Config = typeof config;

/**
 * 설정 객체 반환
 */
export function getConfig(): Config {
  return config;
}

export default config;

