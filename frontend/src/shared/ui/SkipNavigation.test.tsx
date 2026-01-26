import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { SkipNavigation } from "./SkipNavigation";

describe("SkipNavigation", () => {
  it("should render a link element", () => {
    render(<SkipNavigation />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });

  it("should have href pointing to main-content", () => {
    render(<SkipNavigation />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("should have Korean text for skip link", () => {
    render(<SkipNavigation />);
    expect(screen.getByText("메인 콘텐츠로 건너뛰기")).toBeInTheDocument();
  });

  it("should have sr-only class by default (hidden)", () => {
    render(<SkipNavigation />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("sr-only");
  });

  it("should have focus:not-sr-only class to show on focus", () => {
    render(<SkipNavigation />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("focus:not-sr-only");
  });

  it("should have absolute positioning classes for focus state", () => {
    render(<SkipNavigation />);
    const link = screen.getByRole("link");
    expect(link.className).toContain("focus:absolute");
    expect(link.className).toContain("focus:z-50");
  });

  it("should accept custom target id", () => {
    render(<SkipNavigation targetId="custom-target" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#custom-target");
  });

  it("should accept custom label", () => {
    render(<SkipNavigation label="Skip to navigation" />);
    expect(screen.getByText("Skip to navigation")).toBeInTheDocument();
  });
});
