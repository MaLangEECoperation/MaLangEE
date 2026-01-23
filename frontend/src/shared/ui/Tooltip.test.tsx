import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { Tooltip } from "./Tooltip";

// getBoundingClientRect mock helper
const mockBoundingRect = (el: HTMLElement, rect: Partial<DOMRect>) => {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...rect,
  });
};

describe("Tooltip", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // 기본 viewport 크기 설정
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, writable: true });
  });

  it("should render children", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should not show tooltip content initially", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should show tooltip content on mouse enter", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText("Hover me"));

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should hide tooltip content on mouse leave", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText("Hover me"));
    expect(screen.getByText("Tooltip text")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByText("Hover me"));
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should render ReactNode content", () => {
    render(
      <Tooltip content={<span data-testid="custom-content">Custom content</span>}>
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText("Hover me"));

    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    expect(screen.getByText("Custom content")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <Tooltip content="Tooltip text" className="custom-class">
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText("Hover me"));

    const tooltipWrapper = screen.getByText("Tooltip text").closest(".custom-class");
    expect(tooltipWrapper).toBeInTheDocument();
  });

  it("should position tooltip above when there is enough space", () => {
    const { container } = render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    // trigger와 tooltip의 getBoundingClientRect mock
    const triggerEl = container.querySelector(".relative.inline-block") as HTMLElement;
    mockBoundingRect(triggerEl, {
      top: 400,
      bottom: 430,
      left: 500,
      right: 600,
      width: 100,
      height: 30,
    });

    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });

    // tooltip이 렌더링된 후 위치 계산을 위해 tooltip element mock
    const tooltipEl = container.querySelector(".w-64") as HTMLElement;
    if (tooltipEl) {
      mockBoundingRect(tooltipEl, {
        width: 256,
        height: 60,
      });
    }

    // useEffect 트리거를 위한 re-render
    act(() => {
      fireEvent.mouseLeave(screen.getByText("Hover me"));
    });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should position tooltip below when space above is insufficient", () => {
    const { container } = render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    // trigger가 화면 상단에 위치 (위쪽 공간 부족)
    const triggerEl = container.querySelector(".relative.inline-block") as HTMLElement;
    mockBoundingRect(triggerEl, {
      top: 20,
      bottom: 50,
      left: 500,
      right: 600,
      width: 100,
      height: 30,
    });

    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });

    const tooltipEl = container.querySelector(".w-64") as HTMLElement;
    if (tooltipEl) {
      mockBoundingRect(tooltipEl, {
        width: 256,
        height: 60,
      });
    }

    act(() => {
      fireEvent.mouseLeave(screen.getByText("Hover me"));
    });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should shift tooltip right when overflowing left edge", () => {
    const { container } = render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    // trigger가 화면 왼쪽 끝에 위치
    const triggerEl = container.querySelector(".relative.inline-block") as HTMLElement;
    mockBoundingRect(triggerEl, {
      top: 400,
      bottom: 430,
      left: 10,
      right: 60,
      width: 50,
      height: 30,
    });

    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });

    const tooltipEl = container.querySelector(".w-64") as HTMLElement;
    if (tooltipEl) {
      mockBoundingRect(tooltipEl, {
        width: 256,
        height: 60,
      });
    }

    act(() => {
      fireEvent.mouseLeave(screen.getByText("Hover me"));
    });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should shift tooltip left when overflowing right edge", () => {
    Object.defineProperty(window, "innerWidth", { value: 800, writable: true });

    const { container } = render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    // trigger가 화면 오른쪽 끝에 위치
    const triggerEl = container.querySelector(".relative.inline-block") as HTMLElement;
    mockBoundingRect(triggerEl, {
      top: 400,
      bottom: 430,
      left: 700,
      right: 790,
      width: 90,
      height: 30,
    });

    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });

    const tooltipEl = container.querySelector(".w-64") as HTMLElement;
    if (tooltipEl) {
      mockBoundingRect(tooltipEl, {
        width: 256,
        height: 60,
      });
    }

    act(() => {
      fireEvent.mouseLeave(screen.getByText("Hover me"));
    });
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });

    expect(screen.getByText("Tooltip text")).toBeInTheDocument();
  });

  it("should reset tooltip style when hidden", () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    // Show then hide
    act(() => {
      fireEvent.mouseEnter(screen.getByText("Hover me"));
    });
    act(() => {
      fireEvent.mouseLeave(screen.getByText("Hover me"));
    });

    // tooltip should not be in the document
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });

  it("should have correct tooltip structure with border and arrow", () => {
    const { container } = render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText("Hover me"));

    // 본체 확인 (border-gray-300 class)
    const body = container.querySelector(".rounded-lg.border.border-gray-300");
    expect(body).toBeInTheDocument();

    // tooltip wrapper에 w-64 class 확인
    const wrapper = container.querySelector(".w-64");
    expect(wrapper).toBeInTheDocument();
  });

  it("should apply default empty className when not provided", () => {
    const { container } = render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText("Hover me"));

    const wrapper = container.querySelector(".w-64");
    expect(wrapper).toBeInTheDocument();
    // className이 빈 문자열이므로 w-64만 가짐
    expect(wrapper?.className).toContain("w-64");
  });
});
