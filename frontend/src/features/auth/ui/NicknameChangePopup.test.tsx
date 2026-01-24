import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { NicknameChangePopup } from "./NicknameChangePopup";

// Mock react-hook-form to avoid OOM in test worker
const formValues: Record<string, string> = {};
const mockSetValue = vi.fn((name: string, value: string) => {
  formValues[name] = value;
});
const mockSetFocus = vi.fn();

vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: (name: string, options?: { onBlur?: () => void }) => ({
      name,
      onChange: (e: { target: { value: string } }) => {
        formValues[name] = e.target.value;
      },
      onBlur: options?.onBlur || vi.fn(),
      ref: vi.fn(),
    }),
    handleSubmit:
      (onSubmit: (data: Record<string, string>) => void) => (e: { preventDefault: () => void }) => {
        e.preventDefault();
        onSubmit(formValues);
      },
    formState: { errors: {} },
    watch: (name: string) => formValues[name] || "",
    setValue: mockSetValue,
    setFocus: mockSetFocus,
  }),
}));

// Mock features/auth hooks
const mockMutate = vi.fn();
vi.mock("../api", () => ({
  useUpdateNickname: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
  useCurrentUser: () => ({
    data: { nickname: "현재닉", login_id: "test@example.com" },
  }),
}));

vi.mock("../hook", () => ({
  useNicknameCheck: () => ({
    isChecking: false,
    isAvailable: true,
    error: null,
    trigger: vi.fn(),
  }),
}));

vi.mock("../model", () => ({
  nicknameUpdateSchema: {
    safeParse: (data: unknown) => ({ success: true, data }),
  },
}));

// Mock shared/ui
vi.mock("@/shared/ui/Dialog", () => ({
  Dialog: ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div data-testid="dialog" onClick={onClose}>
      {children}
    </div>
  ),
}));

vi.mock("@/shared/ui", () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    type?: string;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} type={type as "button" | "submit"} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  MalangEE: ({ size }: { size: number }) => (
    <div data-testid="malangee" data-size={size}>
      MalangEE
    </div>
  ),
}));

describe("NicknameChangePopup", () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // formValues 초기화
    Object.keys(formValues).forEach((key) => delete formValues[key]);
  });

  it("should render nickname change form", () => {
    render(<NicknameChangePopup {...defaultProps} />);

    expect(screen.getByPlaceholderText("기존 닉네임")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("새로운 닉네임을 입력해주세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "변경하기" })).toBeInTheDocument();
  });

  it("should populate current nickname from user data", async () => {
    render(<NicknameChangePopup {...defaultProps} />);

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith("current_nickname", "현재닉");
    });
  });

  it("should make current nickname field readonly", () => {
    render(<NicknameChangePopup {...defaultProps} />);

    const currentInput = screen.getByPlaceholderText("기존 닉네임");
    expect(currentInput).toHaveAttribute("readonly");
  });

  it("should show error when new nickname equals current nickname", async () => {
    // Override watch mock to simulate same nickname scenario
    formValues["current_nickname"] = "현재닉";
    formValues["new_nickname"] = "현재닉";

    render(<NicknameChangePopup {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/현재 사용중인 닉네임이에요/)).toBeInTheDocument();
    });
  });

  it("should call onClose when close is triggered", () => {
    render(<NicknameChangePopup {...defaultProps} />);

    const dialog = screen.getByTestId("dialog");
    fireEvent.click(dialog);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("should call mutate on valid form submission", async () => {
    formValues["new_nickname"] = "새닉네임";
    formValues["current_nickname"] = "현재닉";

    render(<NicknameChangePopup {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "변경하기" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it("should show success message after mutation succeeds", async () => {
    formValues["new_nickname"] = "새닉네임";
    formValues["current_nickname"] = "현재닉";

    mockMutate.mockImplementation(
      (_data: unknown, options: { onSuccess: (data: { nickname: string }) => void }) => {
        options.onSuccess({ nickname: "새닉네임" });
      }
    );

    render(<NicknameChangePopup {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "변경하기" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("닉네임이 변경되었습니다.")).toBeInTheDocument();
    });
  });
});
