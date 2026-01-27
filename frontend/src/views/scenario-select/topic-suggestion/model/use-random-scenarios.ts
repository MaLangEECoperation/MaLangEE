import { useState, useCallback, useEffect, useRef } from "react";

interface UseRandomScenariosOptions<T> {
  /** 전체 시나리오 배열 */
  scenarios: T[] | undefined;
  /** 표시할 시나리오 개수 (default: 5) */
  count?: number;
}

interface UseRandomScenariosReturn<T> {
  /** 표시할 랜덤 시나리오 배열 */
  displayedScenarios: T[];
  /** 새로운 랜덤 시나리오로 갱신 */
  refresh: () => void;
}

/**
 * 전체 시나리오에서 랜덤으로 선택하여 표시하는 훅
 *
 * @param options - 옵션
 * @returns { displayedScenarios, refresh }
 *
 * @example
 * ```tsx
 * const { displayedScenarios, refresh } = useRandomScenarios({
 *   scenarios: allScenarios,
 *   count: 5,
 * });
 *
 * <button onClick={refresh}>새로고침</button>
 * ```
 */
export function useRandomScenarios<T>(
  options: UseRandomScenariosOptions<T>
): UseRandomScenariosReturn<T> {
  const { scenarios, count = 5 } = options;
  const [displayedScenarios, setDisplayedScenarios] = useState<T[]>([]);
  const prevScenariosRef = useRef<T[] | undefined>(undefined);

  const getRandomScenarios = useCallback((): T[] => {
    if (!scenarios || scenarios.length === 0) return [];
    if (scenarios.length <= count) return [...scenarios];

    const shuffled = [...scenarios].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }, [scenarios, count]);

  const refresh = useCallback(() => {
    setDisplayedScenarios(getRandomScenarios());
  }, [getRandomScenarios]);

  // 시나리오가 변경되면 자동으로 갱신
  useEffect(() => {
    // 시나리오 참조가 변경되었을 때만 갱신
    if (scenarios !== prevScenariosRef.current && scenarios && scenarios.length > 0) {
      prevScenariosRef.current = scenarios;
      const newScenarios = getRandomScenarios();
      setDisplayedScenarios(newScenarios);
    }
  });

  return { displayedScenarios, refresh };
}
