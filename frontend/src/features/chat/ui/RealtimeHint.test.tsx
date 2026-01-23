/**
 * @fileoverview RealtimeHint 컴포넌트 테스트
 * TDD: RED 단계 - 테스트 먼저 작성
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { RealtimeHint } from "./RealtimeHint";

describe("RealtimeHint", () => {
  const defaultProps = {
    hints: [],
    isLoading: false,
    showPrompt: false,
    showHintText: false,
    onRequestHint: vi.fn(),
  };

  describe("힌트 프롬프트 버튼", () => {
    it("showPrompt가 true일 때 힌트 버튼이 렌더링됨", () => {
      render(<RealtimeHint {...defaultProps} showPrompt={true} />);

      expect(screen.getByRole("button", { name: /힌트/i })).toBeInTheDocument();
    });

    it("showPrompt가 false일 때 힌트 버튼이 렌더링되지 않음", () => {
      render(<RealtimeHint {...defaultProps} showPrompt={false} />);

      expect(screen.queryByRole("button", { name: /힌트/i })).not.toBeInTheDocument();
    });

    it("힌트 버튼 클릭 시 onRequestHint가 호출됨", () => {
      const onRequestHint = vi.fn();
      render(<RealtimeHint {...defaultProps} showPrompt={true} onRequestHint={onRequestHint} />);

      fireEvent.click(screen.getByRole("button", { name: /힌트/i }));

      expect(onRequestHint).toHaveBeenCalledTimes(1);
    });
  });

  describe("로딩 상태", () => {
    it("isLoading이 true일 때 로딩 인디케이터가 표시됨", () => {
      render(
        <RealtimeHint {...defaultProps} showPrompt={true} showHintText={true} isLoading={true} />
      );

      expect(screen.getByTestId("hint-loading")).toBeInTheDocument();
    });

    it("isLoading이 false일 때 로딩 인디케이터가 표시되지 않음", () => {
      render(
        <RealtimeHint {...defaultProps} showPrompt={true} showHintText={true} isLoading={false} />
      );

      expect(screen.queryByTestId("hint-loading")).not.toBeInTheDocument();
    });
  });

  describe("힌트 텍스트 표시", () => {
    it("showHintText가 true이고 hints가 있을 때 힌트 말풍선이 렌더링됨", () => {
      const hints = ["How about trying this?", "You could say..."];
      render(
        <RealtimeHint {...defaultProps} showPrompt={true} showHintText={true} hints={hints} />
      );

      expect(screen.getByTestId("hint-bubble")).toBeInTheDocument();
      expect(screen.getByText(/How about trying this\?/)).toBeInTheDocument();
    });

    it("showHintText가 false일 때 힌트 유도 텍스트가 표시됨", () => {
      const hints = ["How about trying this?"];
      render(
        <RealtimeHint {...defaultProps} showPrompt={true} showHintText={false} hints={hints} />
      );

      expect(screen.queryByTestId("hint-bubble")).not.toBeInTheDocument();
      expect(screen.getByText("Lost your words?")).toBeInTheDocument();
      expect(screen.getByText("tap for a hint.")).toBeInTheDocument();
    });

    it("hints가 비어있을 때 기본 메시지가 표시됨", () => {
      render(
        <RealtimeHint
          {...defaultProps}
          showPrompt={true}
          showHintText={true}
          hints={[]}
          isLoading={false}
        />
      );

      expect(screen.getByText(/힌트를 불러오는 중/i)).toBeInTheDocument();
    });
  });

  describe("힌트 상태 전환", () => {
    it("힌트 표시 후 버튼 클릭 시 onRequestHint가 호출되지 않음", () => {
      const onRequestHint = vi.fn();
      const hints = ["Test hint"];
      render(
        <RealtimeHint
          {...defaultProps}
          showPrompt={true}
          showHintText={true}
          hints={hints}
          onRequestHint={onRequestHint}
        />
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onRequestHint).not.toHaveBeenCalled();
    });
  });

  describe("접근성", () => {
    it("클릭 전 힌트 버튼에 적절한 aria-label이 있음", () => {
      render(<RealtimeHint {...defaultProps} showPrompt={true} />);

      const button = screen.getByRole("button", { name: /힌트 보기/i });
      expect(button).toHaveAttribute("aria-label", "힌트 보기");
    });

    it("클릭 후 힌트 버튼에 적절한 aria-label이 있음", () => {
      const hints = ["Test hint"];
      render(
        <RealtimeHint {...defaultProps} showPrompt={true} showHintText={true} hints={hints} />
      );

      const button = screen.getByRole("button", { name: /힌트/i });
      expect(button).toHaveAttribute("aria-label", "힌트");
    });
  });
});
