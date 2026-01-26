import type { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

/**
 * Dashboard Layout with Parallel Route
 * - children: 대시보드 메인 페이지
 * - modal: @modal 슬롯 (Intercepted Route로 모달 표시)
 */
export default function DashboardLayout({ children, modal }: DashboardLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
