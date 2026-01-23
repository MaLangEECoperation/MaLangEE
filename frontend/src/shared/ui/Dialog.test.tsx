import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("renders children content", () => {
    render(
      <Dialog onClose={() => {}}>
        <div>Popup Content</div>
      </Dialog>
    );
    expect(screen.getByText("Popup Content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(
      <Dialog onClose={() => {}} title="Test Title">
        <div>Content</div>
      </Dialog>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders close button by default", () => {
    render(
      <Dialog onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    );
    expect(screen.getByLabelText("닫기")).toBeInTheDocument();
  });

  it("hides close button when showCloseButton is false", () => {
    render(
      <Dialog onClose={() => {}} showCloseButton={false}>
        <div>Content</div>
      </Dialog>
    );
    expect(screen.queryByLabelText("닫기")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <Dialog onClose={handleClose}>
        <div>Content</div>
      </Dialog>
    );

    fireEvent.click(screen.getByLabelText("닫기"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const handleClose = vi.fn();
    render(
      <Dialog onClose={handleClose}>
        <div>Content</div>
      </Dialog>
    );

    const backdrop = document.querySelector(".fixed.inset-0");
    fireEvent.click(backdrop!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when content is clicked", () => {
    const handleClose = vi.fn();
    render(
      <Dialog onClose={handleClose}>
        <div>Content</div>
      </Dialog>
    );

    fireEvent.click(screen.getByText("Content"));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("renders headerContent when provided", () => {
    render(
      <Dialog onClose={() => {}} headerContent={<div>Custom Header</div>}>
        <div>Content</div>
      </Dialog>
    );
    expect(screen.getByText("Custom Header")).toBeInTheDocument();
  });

  it("prefers headerContent over title", () => {
    render(
      <Dialog onClose={() => {}} title="Title" headerContent={<div>Custom Header</div>}>
        <div>Content</div>
      </Dialog>
    );
    expect(screen.getByText("Custom Header")).toBeInTheDocument();
    expect(screen.queryByText("Title")).not.toBeInTheDocument();
  });

  it("applies default maxWidth of 2xl", () => {
    render(
      <Dialog onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    );
    const popup = document.querySelector(".max-w-2xl");
    expect(popup).toBeInTheDocument();
  });

  it("applies custom maxWidth", () => {
    const { rerender } = render(
      <Dialog onClose={() => {}} maxWidth="sm">
        <div>Content</div>
      </Dialog>
    );
    expect(document.querySelector(".max-w-sm")).toBeInTheDocument();

    rerender(
      <Dialog onClose={() => {}} maxWidth="lg">
        <div>Content</div>
      </Dialog>
    );
    expect(document.querySelector(".max-w-lg")).toBeInTheDocument();

    rerender(
      <Dialog onClose={() => {}} maxWidth="4xl">
        <div>Content</div>
      </Dialog>
    );
    expect(document.querySelector(".max-w-4xl")).toBeInTheDocument();
  });
});
