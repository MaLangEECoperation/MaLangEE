"use client";

import { useEffect, type FC, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hook";

interface GuestGuardProps {
  children: ReactNode;
  /** 이미 인증된 경우 리다이렉트할 경로 */
  redirectTo?: string;
}

/**
 * 비인증 사용자(게스트)만 접근 가능한 라우트를 보호하는 컴포넌트
 * 로그인 페이지, 회원가입 페이지 등에 사용
 *
 * @example
 * ```tsx
 * <GuestGuard>
 *   <LoginPage />
 * </GuestGuard>
 * ```
 */
export const GuestGuard: FC<GuestGuardProps> = ({
  children,
  redirectTo = "/topic-select",
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // 로딩 중이거나 이미 인증됨 (리다이렉트 중)
  if (isLoading || isAuthenticated) {
    return (

        <div className="border-primary-700 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />

    );
  }

  return <>{children}</>;
};
