/**
 * 애플리케이션 공통 설정
 * 환경 변수와 기본값을 관리하는 파일
 */

export const config = {
  // 로컬호스트 URL (개발 환경용)
  localhostUrl: process.env.NEXT_PUBLIC_LOCALHOST_URL,

  // 백엔드 API 기본 URL
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL,

  // API 기본 경로
  apiBasePath: "/api/v1",

  // 완전한 API URL (baseUrl + basePath)
  get apiUrl(): string {
    return `${this.apiBaseUrl}${this.apiBasePath}`;
  },
} as const;

export default config;
