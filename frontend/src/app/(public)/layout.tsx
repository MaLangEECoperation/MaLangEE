import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * Public Route Group Layout
 * - 인증 없이 접근 가능한 페이지들 (/auth/login, /auth/signup, /auth/logout)
 * - 추후 공개 페이지 공통 레이아웃 요소 추가 가능
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return <>{children}</>;
}
