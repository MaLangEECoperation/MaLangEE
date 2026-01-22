import { STORAGE_KEYS } from "@/shared/config";

import type { User } from "./schema";

/**
 * 토큰 관리 유틸리티
 * localStorage 기반 토큰 저장/조회/삭제
 */
export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  set: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
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
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  },

  set: (user: User): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  exists: (): boolean => {
    return userStorage.get() !== null;
  },
};
