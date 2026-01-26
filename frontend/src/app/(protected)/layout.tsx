import type { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

/**
 * Protected Route Group Layout
 * - 인증이 필요한 페이지들 (/dashboard)
 * - 참고: 현재 DashboardPage 내부에서 AuthGuard 컴포넌트를 직접 사용 중
 * - 추후 레이아웃 레벨로 AuthGuard 이동 가능
 */
export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <>{children}</>;
}
