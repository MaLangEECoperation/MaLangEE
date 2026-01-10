import { FC, ReactNode } from "react";
import "./GlassCard.css";

/**
 * 글래스모피즘 카드 컴포넌트의 Props
 */
export interface GlassCardProps {
  /** 카드 본문 내용 */
  children: ReactNode;
  /** 카드 헤더 영역 (선택) */
  header?: ReactNode;
  /** 카드 푸터 영역 (선택) */
  footer?: ReactNode;
  /** 배경 장식 원형(blob) 표시 여부 */
  withBackground?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

export const GlassCard: FC<GlassCardProps> = ({
  children,
  header,
  footer,
  withBackground = true,
  className = "",
}) => {
  return (
    <div className={`glass-page ${className}`}>
      {/* Background Blobs */}
      {withBackground && (
        <>
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </>
      )}

      {/* Main Card */}
      <main className="glass-card">
        {/* Header */}
        {header && <header className="glass-card-header">{header}</header>}

        {/* Content */}
        <section className="glass-card-content">{children}</section>

        {/* Footer */}
        {footer && <footer className="glass-card-footer">{footer}</footer>}
      </main>
    </div>
  );
};
