const TOKEN_KEY = "access_token";

/**
 * 토큰 관리 유틸리티
 * localStorage 기반 토큰 저장/조회/삭제
 */
export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  set: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  },

  exists: (): boolean => {
    return tokenStorage.get() !== null;
  },
};
