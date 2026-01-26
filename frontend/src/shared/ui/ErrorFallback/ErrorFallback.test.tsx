import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { ErrorFallback } from "./ErrorFallback";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("ErrorFallback", () => {
  it("renders default error title", () => {
    render(<ErrorFallback />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("문제가 발생했습니다");
  });

  it("renders custom title", () => {
    render(<ErrorFallback title="커스텀 에러 제목" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("커스텀 에러 제목");
  });

  it("renders default error message", () => {
    render(<ErrorFallback />);

    expect(
      screen.getByText("예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
    ).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<ErrorFallback message="커스텀 에러 메시지입니다." />);

    expect(screen.getByText("커스텀 에러 메시지입니다.")).toBeInTheDocument();
  });

  it("renders MalangEE character", () => {
    render(<ErrorFallback />);

    // MalangEE 컴포넌트가 렌더링되는지 확인 (SVG 또는 이미지)
    const malangee = screen.getByTestId("malangee");
    expect(malangee).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const handleRetry = vi.fn();
    render(<ErrorFallback onRetry={handleRetry} />);

    const retryButton = screen.getByRole("button", { name: /다시 시도/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorFallback />);

    expect(screen.queryByRole("button", { name: /다시 시도/i })).not.toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const handleRetry = vi.fn();
    render(<ErrorFallback onRetry={handleRetry} />);

    const retryButton = screen.getByRole("button", { name: /다시 시도/i });
    fireEvent.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders home button when showHomeButton is true", () => {
    render(<ErrorFallback showHomeButton />);

    const homeLink = screen.getByRole("link", { name: /홈으로/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("does not render home button when showHomeButton is false", () => {
    render(<ErrorFallback showHomeButton={false} />);

    expect(screen.queryByRole("link", { name: /홈으로/i })).not.toBeInTheDocument();
  });

  it("renders both retry and home buttons", () => {
    const handleRetry = vi.fn();
    render(<ErrorFallback onRetry={handleRetry} showHomeButton />);

    expect(screen.getByRole("button", { name: /다시 시도/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /홈으로/i })).toBeInTheDocument();
  });
});
