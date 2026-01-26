/**
 * @fileoverview LanguageNotRecognizedDialog 컴포넌트 테스트
 * TDD: RED 단계 - 테스트 먼저 작성
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { LanguageNotRecognizedDialog } from "./LanguageNotRecognizedDialog";

describe("LanguageNotRecognizedDialog", () => {
  const defaultProps = {
    isOpen: false,
    onRetry: vi.fn(),
    onSwitchToText: vi.fn(),
    onClose: vi.fn(),
  };

  describe("렌더링", () => {
    it("isOpen이 true일 때 다이얼로그가 렌더링됨", () => {
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("isOpen이 false일 때 다이얼로그가 렌더링되지 않음", () => {
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("에러 메시지가 표시됨", () => {
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={true} />);

      // 제목이 Dialog의 title로 전달됨
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/이해하지 못했어요/i);
    });

    it("안내 메시지가 표시됨", () => {
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByText(/다시 말씀해 주세요/i)).toBeInTheDocument();
    });
  });

  describe("버튼 인터랙션", () => {
    it("다시 말하기 버튼 클릭 시 onRetry가 호출됨", () => {
      const onRetry = vi.fn();
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={true} onRetry={onRetry} />);

      fireEvent.click(screen.getByRole("button", { name: /다시 말하기/i }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("텍스트로 입력하기 버튼 클릭 시 onSwitchToText가 호출됨", () => {
      const onSwitchToText = vi.fn();
      render(
        <LanguageNotRecognizedDialog
          {...defaultProps}
          isOpen={true}
          onSwitchToText={onSwitchToText}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /텍스트로 입력/i }));

      expect(onSwitchToText).toHaveBeenCalledTimes(1);
    });
  });

  describe("MalangEE 캐릭터", () => {
    it("MalangEE 캐릭터가 표시됨", () => {
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={true} />);

      // MalangEE 컴포넌트가 렌더링되는지 확인 (이미지 또는 SVG)
      expect(screen.getByTestId("malangee-character")).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("다이얼로그에 적절한 role이 적용됨", () => {
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("다이얼로그에 aria-labelledby가 적용됨", () => {
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={true} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");
    });

    it("모든 버튼이 키보드로 접근 가능함", () => {
      render(<LanguageNotRecognizedDialog {...defaultProps} isOpen={true} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute("tabindex", "-1");
      });
    });
  });

  describe("커스텀 메시지", () => {
    it("커스텀 타이틀이 표시됨", () => {
      render(
        <LanguageNotRecognizedDialog {...defaultProps} isOpen={true} title="영어로 말씀해 주세요" />
      );

      expect(screen.getByText("영어로 말씀해 주세요")).toBeInTheDocument();
    });

    it("커스텀 설명이 표시됨", () => {
      render(
        <LanguageNotRecognizedDialog
          {...defaultProps}
          isOpen={true}
          description="말랭이는 영어만 이해할 수 있어요"
        />
      );

      expect(screen.getByText("말랭이는 영어만 이해할 수 있어요")).toBeInTheDocument();
    });
  });
});
