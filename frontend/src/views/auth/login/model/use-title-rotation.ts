import { useState, useCallback } from "react";

import { useInterval } from "@/shared/lib";

import { LOGIN_TIMER } from "../config";

interface UseTitleRotationOptions<T> {
  /** 로테이션할 아이템 배열 */
  items: T[];
  /** 로테이션 간격 (ms, default: 4000) */
  intervalMs?: number;
}

interface UseTitleRotationReturn {
  /** 현재 활성화된 인덱스 */
  activeIndex: number;
  /** 인덱스 직접 설정 */
  setActiveIndex: (index: number) => void;
}

/**
 * 타이틀 로테이션을 관리하는 훅
 *
 * 지정된 간격으로 인덱스를 순환하며, 마지막 인덱스 후에는 0으로 돌아갑니다.
 *
 * @param options - 로테이션 옵션
 * @returns { activeIndex, setActiveIndex }
 *
 * @example
 * ```tsx
 * const titles = ['안녕하세요', 'Hello', 'Bonjour'];
 * const { activeIndex } = useTitleRotation({ items: titles, intervalMs: 4000 });
 *
 * <h1>{titles[activeIndex]}</h1>
 * ```
 */
export function useTitleRotation<T>(options: UseTitleRotationOptions<T>): UseTitleRotationReturn {
  const { items, intervalMs = LOGIN_TIMER.TITLE_ROTATION_MS } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const rotate = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useInterval(rotate, intervalMs);

  return { activeIndex, setActiveIndex };
}
