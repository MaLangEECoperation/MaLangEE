/**
 * 애플리케이션 공통 설정
 * @deprecated shared/config/api.ts를 직접 사용하세요.
 * 하위 호환성을 위해 유지됩니다.
 */

import { API_BASE_URL, API_BASE_PATH, getApiUrl } from "@/shared/config/api";

export const config = {
  apiBaseUrl: API_BASE_URL,
  apiBasePath: API_BASE_PATH,
  get apiUrl(): string {
    return getApiUrl();
  },
} as const;

export default config;
