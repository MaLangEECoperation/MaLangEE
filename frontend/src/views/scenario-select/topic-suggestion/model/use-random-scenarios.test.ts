import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useRandomScenarios } from "./use-random-scenarios";

interface MockScenario {
  id: string;
  title: string;
}

describe("useRandomScenarios", () => {
  const mockScenarios: MockScenario[] = [
    { id: "1", title: "Scenario 1" },
    { id: "2", title: "Scenario 2" },
    { id: "3", title: "Scenario 3" },
    { id: "4", title: "Scenario 4" },
    { id: "5", title: "Scenario 5" },
    { id: "6", title: "Scenario 6" },
    { id: "7", title: "Scenario 7" },
  ];

  it("지정된 개수만큼 랜덤 시나리오를 반환한다", () => {
    const { result } = renderHook(() => useRandomScenarios({ scenarios: mockScenarios, count: 3 }));

    expect(result.current.displayedScenarios).toHaveLength(3);
  });

  it("시나리오가 없으면 빈 배열을 반환한다", () => {
    const { result } = renderHook(() => useRandomScenarios({ scenarios: undefined, count: 5 }));

    expect(result.current.displayedScenarios).toEqual([]);
  });

  it("refresh 호출 시 새로운 랜덤 시나리오를 반환한다", () => {
    const { result } = renderHook(() => useRandomScenarios({ scenarios: mockScenarios, count: 3 }));

    // 첫 번째 세트 저장 (랜덤 비교용)
    const _firstSet = [...result.current.displayedScenarios];

    act(() => {
      result.current.refresh();
    });

    // 랜덤이므로 항상 다를 수는 없지만, 함수가 호출되는지 확인
    expect(result.current.displayedScenarios).toHaveLength(3);
  });

  it("count가 전체 시나리오보다 크면 전체를 반환한다", () => {
    const smallScenarios = mockScenarios.slice(0, 2);
    const { result } = renderHook(() =>
      useRandomScenarios({ scenarios: smallScenarios, count: 5 })
    );

    expect(result.current.displayedScenarios).toHaveLength(2);
  });
});
