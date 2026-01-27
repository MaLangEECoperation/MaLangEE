import { render, fireEvent, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { MIC_BUTTON_LABELS } from "@/shared/config";

import { MicButton } from "./MicButton";

describe("MicButton", () => {
  it("renders with default props", () => {
    render(<MicButton isListening={false} onClick={() => {}} />);

    const container = document.querySelector(".mic-container");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("mic-container-md");
    expect(container).not.toHaveClass("is-listening");
    expect(container).not.toHaveClass("is-muted");
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<MicButton isListening={false} onClick={handleClick} />);

    const container = document.querySelector(".mic-container");
    fireEvent.click(container!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies is-listening class when isListening is true", () => {
    render(<MicButton isListening={true} onClick={() => {}} />);

    const container = document.querySelector(".mic-container");
    expect(container).toHaveClass("is-listening");
  });

  it("applies is-muted class when isMuted is true", () => {
    render(<MicButton isListening={false} onClick={() => {}} isMuted={true} />);

    const container = document.querySelector(".mic-container");
    expect(container).toHaveClass("is-muted");
  });

  it("renders Mic icon when not muted", () => {
    render(<MicButton isListening={false} onClick={() => {}} isMuted={false} />);

    const micIcon = document.querySelector(".mic-main svg");
    expect(micIcon).toBeInTheDocument();
  });

  it("renders MicOff icon when muted", () => {
    render(<MicButton isListening={false} onClick={() => {}} isMuted={true} />);

    const micOffIcon = document.querySelector(".mic-main svg");
    expect(micOffIcon).toBeInTheDocument();
  });

  it("applies small size class", () => {
    render(<MicButton isListening={false} onClick={() => {}} size="sm" />);

    const container = document.querySelector(".mic-container");
    expect(container).toHaveClass("mic-container-sm");
    expect(container).not.toHaveClass("mic-container-md");
    expect(container).not.toHaveClass("mic-container-lg");
  });

  it("applies medium size class (default)", () => {
    render(<MicButton isListening={false} onClick={() => {}} size="md" />);

    const container = document.querySelector(".mic-container");
    expect(container).toHaveClass("mic-container-md");
  });

  it("applies large size class", () => {
    render(<MicButton isListening={false} onClick={() => {}} size="lg" />);

    const container = document.querySelector(".mic-container");
    expect(container).toHaveClass("mic-container-lg");
  });

  it("merges custom className", () => {
    render(<MicButton isListening={false} onClick={() => {}} className="custom-class" />);

    const container = document.querySelector(".mic-container");
    expect(container).toHaveClass("custom-class");
    expect(container).toHaveClass("mic-container-md");
  });

  it("renders wave animation elements", () => {
    render(<MicButton isListening={true} onClick={() => {}} />);

    expect(document.querySelector(".waves")).toBeInTheDocument();
    expect(document.querySelector(".wave-1")).toBeInTheDocument();
    expect(document.querySelector(".wave-2")).toBeInTheDocument();
    expect(document.querySelector(".wave-3")).toBeInTheDocument();
  });

  it("combines multiple state classes correctly", () => {
    render(
      <MicButton
        isListening={true}
        onClick={() => {}}
        isMuted={true}
        size="lg"
        className="extra-class"
      />
    );

    const container = document.querySelector(".mic-container");
    expect(container).toHaveClass("mic-container-lg");
    expect(container).toHaveClass("is-listening");
    expect(container).toHaveClass("is-muted");
    expect(container).toHaveClass("extra-class");
  });

  // === Accessibility Tests ===
  describe("Accessibility", () => {
    it("renders as a button element for keyboard accessibility", () => {
      render(<MicButton isListening={false} onClick={() => {}} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("has aria-pressed=false when not listening", () => {
      render(<MicButton isListening={false} onClick={() => {}} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("has aria-pressed=true when listening", () => {
      render(<MicButton isListening={true} onClick={() => {}} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("has correct aria-label when idle", () => {
      render(<MicButton isListening={false} onClick={() => {}} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", MIC_BUTTON_LABELS.IDLE);
    });

    it("has correct aria-label when listening", () => {
      render(<MicButton isListening={true} onClick={() => {}} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", MIC_BUTTON_LABELS.LISTENING);
    });

    it("has correct aria-label when muted", () => {
      render(<MicButton isListening={false} onClick={() => {}} isMuted={true} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", MIC_BUTTON_LABELS.MUTED);
    });

    it("supports keyboard activation with Enter key", () => {
      const handleClick = vi.fn();
      render(<MicButton isListening={false} onClick={handleClick} />);

      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: "Enter" });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("supports keyboard activation with Space key", () => {
      const handleClick = vi.fn();
      render(<MicButton isListening={false} onClick={handleClick} />);

      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: " " });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("has type=button to prevent form submission", () => {
      render(<MicButton isListening={false} onClick={() => {}} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("is disabled when disabled prop is true", () => {
      const handleClick = vi.fn();
      render(<MicButton isListening={false} onClick={handleClick} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();

      // Click should not trigger onClick when disabled
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("applies is-disabled class when disabled", () => {
      render(<MicButton isListening={false} onClick={() => {}} disabled={true} />);

      const container = document.querySelector(".mic-container");
      expect(container).toHaveClass("is-disabled");
    });
  });
});
