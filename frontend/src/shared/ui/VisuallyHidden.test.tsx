import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { VisuallyHidden } from "./VisuallyHidden";

describe("VisuallyHidden", () => {
  it("should render children", () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    expect(screen.getByText("Hidden text")).toBeInTheDocument();
  });

  it("should have sr-only class for screen reader only content", () => {
    render(<VisuallyHidden>Screen reader only</VisuallyHidden>);
    const element = screen.getByText("Screen reader only");
    expect(element).toHaveClass("sr-only");
  });

  it("should render as span by default", () => {
    render(<VisuallyHidden>Text</VisuallyHidden>);
    const element = screen.getByText("Text");
    expect(element.tagName).toBe("SPAN");
  });

  it("should accept custom className", () => {
    render(<VisuallyHidden className="custom-class">Text</VisuallyHidden>);
    const element = screen.getByText("Text");
    expect(element).toHaveClass("sr-only");
    expect(element).toHaveClass("custom-class");
  });

  it("should be accessible to screen readers", () => {
    render(<VisuallyHidden>Important announcement</VisuallyHidden>);
    // The element should be in the document and readable by assistive tech
    expect(screen.getByText("Important announcement")).toBeInTheDocument();
  });
});
