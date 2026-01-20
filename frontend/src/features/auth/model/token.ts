import type { User } from "./schema";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

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

/**
 * 사용자 정보 관리 유틸리티
 * localStorage 기반 사용자 정보 저장/조회/삭제
 */
export const userStorage = {
  get: (): User | null => {
    if (typeof window === "undefined") return null;
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  },

  set: (user: User): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(USER_KEY);
  },

  exists: (): boolean => {
    return userStorage.get() !== null;
  },
};
