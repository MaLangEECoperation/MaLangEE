"use client";

import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 10; // 툴팁과 요소 사이 간격

      // 1. 상하 위치 결정
      const spaceAbove = triggerRect.top;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const tooltipHeight = tooltipRect.height;

      // 위쪽 공간이 충분하거나, 아래쪽보다 위쪽 공간이 더 많으면 위쪽에 배치
      const isTop = spaceAbove >= tooltipHeight + gap || spaceAbove > spaceBelow;

      // 2. 좌우 위치 결정 (화면 벗어남 방지)
      const tooltipWidth = tooltipRect.width;
      const triggerCenter = triggerRect.left + triggerRect.width / 2;

      // 기본 위치(중앙 정렬)에서의 툴팁 좌우 좌표
      const tooltipLeft = triggerCenter - tooltipWidth / 2;
      const tooltipRight = tooltipLeft + tooltipWidth;

      let shiftX = 0;
      const margin = 10; // 화면 가장자리 여백

      if (tooltipLeft < margin) {
        // 왼쪽으로 벗어남 -> 오른쪽으로 이동 (+)
        shiftX = margin - tooltipLeft;
      } else if (tooltipRight > viewportWidth - margin) {
        // 오른쪽으로 벗어남 -> 왼쪽으로 이동 (-)
        shiftX = viewportWidth - margin - tooltipRight;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTooltipStyle({
        opacity: 1,
        position: "absolute",
        left: "50%",
        top: isTop ? "auto" : `calc(100% + ${gap}px)`,
        bottom: isTop ? `calc(100% + ${gap}px)` : "auto",
        transform: `translateX(calc(-50% + ${shiftX}px))`,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
        zIndex: 50,
      });

      setArrowStyle({
        position: "absolute",
        left: "50%",
        // 툴팁 박스가 shiftX만큼 이동했으므로, 꼬리는 반대로 -shiftX만큼 이동해야 트리거 중앙 유지
        marginLeft: `${-shiftX}px`,
        bottom: isTop ? "-5px" : "auto",
        top: isTop ? "auto" : "-5px",
        width: "10px",
        height: "10px",
        backgroundColor: "white",
        transform: "translateX(-50%) rotate(45deg)",
        // 테두리 방향 설정 (Tailwind gray-300: #d1d5db)
        borderBottom: isTop ? "1px solid #d1d5db" : "none",
        borderRight: isTop ? "1px solid #d1d5db" : "none",
        borderTop: !isTop ? "1px solid #d1d5db" : "none",
        borderLeft: !isTop ? "1px solid #d1d5db" : "none",
      });
    } else {
      // 안 보일 때는 스타일 초기화 (다음에 보일 때 opacity 0부터 시작)
      setTooltipStyle({ opacity: 0 });
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        {children}
      </div>
      {isVisible && (
        <div ref={tooltipRef} className={`w-64 ${className}`} style={tooltipStyle}>
          {/* 본체 */}
          <div className="relative rounded-lg border border-gray-300 bg-white px-4 py-3 text-xs">
            {content}
          </div>

          {/* 꼬리 */}
          <div style={arrowStyle} />
        </div>
      )}
    </div>
  );
};
