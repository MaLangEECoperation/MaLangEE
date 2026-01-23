/**
 * @fileoverview SignupPromptDialog 컴포넌트 테스트
 * TDD: RED 단계 - 테스트 먼저 작성
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { SignupPromptDialog } from "./SignupPromptDialog";

describe("SignupPromptDialog", () => {
  const defaultProps = {
    isOpen: false,
    onSignup: vi.fn(),
    onContinueAsGuest: vi.fn(),
    onClose: vi.fn(),
  };

  describe("렌더링", () => {
    it("isOpen이 true일 때 다이얼로그가 렌더링됨", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("isOpen이 false일 때 다이얼로그가 렌더링되지 않음", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("가입 권유 메시지가 표시됨", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={true} />);

      // 타이틀에 회원가입 메시지가 포함됨
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/회원가입/i);
    });

    it("대화 기록 저장 혜택이 안내됨", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={true} />);

      // 설명에 학습 진도 추적 안내가 포함됨
      expect(screen.getByText(/학습 진도를 추적/i)).toBeInTheDocument();
    });
  });

  describe("버튼 인터랙션", () => {
    it("회원가입하기 버튼 클릭 시 onSignup이 호출됨", () => {
      const onSignup = vi.fn();
      render(<SignupPromptDialog {...defaultProps} isOpen={true} onSignup={onSignup} />);

      fireEvent.click(screen.getByRole("button", { name: /회원가입/i }));

      expect(onSignup).toHaveBeenCalledTimes(1);
    });

    it("나중에 하기 버튼 클릭 시 onContinueAsGuest가 호출됨", () => {
      const onContinueAsGuest = vi.fn();
      render(
        <SignupPromptDialog {...defaultProps} isOpen={true} onContinueAsGuest={onContinueAsGuest} />
      );

      fireEvent.click(screen.getByRole("button", { name: /나중에/i }));

      expect(onContinueAsGuest).toHaveBeenCalledTimes(1);
    });
  });

  describe("MalangEE 캐릭터", () => {
    it("MalangEE 캐릭터가 표시됨", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={true} />);

      // MalangEE 컴포넌트가 렌더링되는지 확인 (이미지 또는 SVG)
      expect(screen.getByTestId("malangee-character")).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("다이얼로그에 적절한 role이 적용됨", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("다이얼로그에 aria-labelledby가 적용됨", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={true} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");
    });

    it("모든 버튼이 키보드로 접근 가능함", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={true} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute("tabindex", "-1");
      });
    });
  });

  describe("커스텀 메시지", () => {
    it("커스텀 타이틀이 표시됨", () => {
      render(<SignupPromptDialog {...defaultProps} isOpen={true} title="대화가 끝났어요!" />);

      expect(screen.getByText("대화가 끝났어요!")).toBeInTheDocument();
    });

    it("커스텀 설명이 표시됨", () => {
      render(
        <SignupPromptDialog
          {...defaultProps}
          isOpen={true}
          description="회원가입하면 대화를 저장할 수 있어요"
        />
      );

      expect(screen.getByText("회원가입하면 대화를 저장할 수 있어요")).toBeInTheDocument();
    });
  });
});
