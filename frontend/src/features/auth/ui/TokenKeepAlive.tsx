"use client";

import { useEffect } from "react";

import { debugLog, debugError, isTokenExpired, isTokenExpiringSoon } from "@/shared/lib";

import { AUTH_VALIDATION } from "../config";
import { useAuth } from "../hook";
import { tokenStorage } from "../model";

/**
 * 토큰 유지 컴포넌트
 * 로그인한 사용자의 세션을 자동으로 유지합니다.
 *
 * 동작 방식:
 * 1. 5분마다 토큰 상태 자동 체크
 * 2. 토큰 만료 시 → 알림 + 자동 로그아웃
 * 3. 토큰 10분 이내 만료 예정 → refreshUser() 호출로 세션 연장
 */
export function TokenKeepAlive() {
  const { refreshUser, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // 로그인하지 않은 사용자는 무시
    if (!isAuthenticated) return;

    const token = tokenStorage.get();
    if (!token) return;

    // 토큰 체크 함수
    const checkToken = async () => {
      const currentToken = tokenStorage.get();
      if (!currentToken) return;

      // 토큰이 이미 만료됨
      if (isTokenExpired(currentToken)) {
        debugError("[TokenKeepAlive] Token expired, logging out");
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        logout();
        return;
      }

      // 토큰이 10분 이내로 만료 예정
      if (isTokenExpiringSoon(currentToken, 600)) {
        debugLog("[TokenKeepAlive] Token expiring soon, refreshing user session");
        try {
          await refreshUser();
          debugLog("[TokenKeepAlive] User session refreshed successfully");
        } catch (error) {
          debugError("[TokenKeepAlive] Failed to refresh user session:", error);
        }
      }
    };

    // 초기 체크
    checkToken();

    // 5분마다 체크
    const interval = setInterval(checkToken, AUTH_VALIDATION.TOKEN.CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUser, logout]);

  // UI를 렌더링하지 않음 (로직만 수행)
  return null;
}
