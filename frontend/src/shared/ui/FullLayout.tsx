import React from "react";
import Image from "next/image";
import { GlassCard } from "./GlassCard";

interface FullLayoutProps {
  leftChildren?: React.ReactNode;
  rightChildren: React.ReactNode;
  bgImage?: string;
  leftColSpan?: number; // 왼쪽 영역의 그리드 비율 (1-11)
  rightColSpan?: number; // 오른쪽 영역의 그리드 비율 (1-11)
}

export const FullLayout = ({
  leftChildren,
  rightChildren,
  bgImage = "/images/login-bg-02.png", // 기본 배경 설정
  leftColSpan = 6, // 기본값 6/12
  rightColSpan = 6, // 기본값 6/12
}: FullLayoutProps) => {
  return (
    <div className="relative min-h-screen overflow-hidden text-[#1F1C2B]">
      {/* Background Image */}
      <Image src={bgImage} alt="Background" fill priority sizes="100vw" className="object-cover" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-12 md:gap-12 md:px-12">
        {/* Left Content Section */}
        <div
          className="col-span-1 flex flex-col items-start justify-center gap-8"
          style={{
            gridColumn: `span ${leftColSpan} / span ${leftColSpan}`,
          }}
        >
          <div className="text-xl font-semibold text-[#5F51D9]">MalangEE</div>
          <div className="relative flex items-center gap-6">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <Image
                src="/images/mascot.svg"
                alt="MalangEE mascot"
                width={128}
                height={128}
                priority
                className="h-32 w-32 object-contain"
              />
            </div>
          </div>
          {leftChildren && <div className="space-y-2">{leftChildren}</div>}
        </div>

        {/* Right Content Section */}
        <div
          className="col-span-1 flex items-center min-h-screen justify-center"
          style={{
            gridColumn: `span ${rightColSpan} / span ${rightColSpan}`,
          }}
        >
          <GlassCard withBackground={false}>
            {rightChildren}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
