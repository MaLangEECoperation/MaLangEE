import { useState, useEffect } from "react";

interface UseConnectionTrackerOptions {
  /** 현재 연결 상태 */
  isConnected: boolean;
}

interface UseConnectionTrackerReturn {
  /** 한 번이라도 연결된 적이 있는지 여부 */
  wasConnected: boolean;
}

/**
 * 연결 이력을 추적하는 훅
 *
 * 한 번이라도 연결에 성공했는지 여부를 추적하여
 * 연결 끊김 시 재연결 UI를 표시하는 데 사용합니다.
 *
 * @param options - 옵션
 * @returns { wasConnected }
 *
 * @example
 * ```tsx
 * const { wasConnected } = useConnectionTracker({ isConnected: state.isConnected });
 *
 * // 연결이 끊겼지만 이전에 연결된 적이 있으면 재연결 UI 표시
 * if (!isConnected && wasConnected) {
 *   return <ReconnectUI />;
 * }
 * ```
 */
export function useConnectionTracker(
  options: UseConnectionTrackerOptions
): UseConnectionTrackerReturn {
  const { isConnected } = options;
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (isConnected && !wasConnected) {
      setWasConnected(true);
    }
  }, [isConnected, wasConnected]);

  return { wasConnected };
}
