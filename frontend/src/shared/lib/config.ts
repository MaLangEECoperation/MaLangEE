/**
 * 애플리케이션 공통 설정
 * 환경 변수와 기본값을 관리하는 파일
 */

export const config = {
  // 백엔드 API 기본 URL (서버 사이드용)
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://49.50.137.35:8080",

  // API 기본 경로
  apiBasePath: "/api/v1",

  /**
   * 완전한 API URL (baseUrl + basePath)
   * Mixed Content 에러 방지를 위해 클라이언트 사이드에서는 항상 상대 경로(/api/v1)를 사용합니다.
   * Next.js의 rewrites 설정이 이 요청을 실제 백엔드(HTTP)로 전달합니다.
   */
  get apiUrl(): string {
    // 브라우저 환경(클라이언트)에서는 상대 경로 사용
    if (typeof window !== "undefined") {
      return this.apiBasePath;
    }

    // 서버 사이드(SSR/SSG) 환경에서는 전체 URL 사용
    return `${this.apiBaseUrl}${this.apiBasePath}`;
  },
} as const;

export default config;
