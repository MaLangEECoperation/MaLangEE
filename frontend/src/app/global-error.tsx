"use client";

import { Geist, Noto_Sans } from "next/font/google";

import { ErrorFallback } from "@/shared";

// global-error는 RootLayout을 대체하므로 폰트를 직접 설정해야 함
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

/**
 * 전역 에러 바운더리
 *
 * - 앱 전체 크래시 시 표시 (RootLayout 에러 포함)
 * - 자체 html/body를 렌더링해야 함 (RootLayout 대체)
 * - reset() 호출로 복구 시도 가능
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 에러 로깅 (프로덕션에서는 에러 리포팅 서비스로 전송)
  console.error("Global error:", error);

  return (
    <html lang="ko" className="h-full">
      <body
        className={`${geistSans.variable} ${notoSans.variable} h-full antialiased`}
        style={{ fontFamily: "var(--font-noto-sans)" }}
      >
        <ErrorFallback
          title="앱에 문제가 발생했습니다"
          message="예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요."
          onRetry={reset}
          showHomeButton
          showBackground
        />
      </body>
    </html>
  );
}
