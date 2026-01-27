import { useRef, useEffect, useCallback, type RefObject } from "react";

interface UseInfiniteScrollOptions {
  /** 다음 페이지가 있는지 여부 */
  hasNextPage: boolean;
  /** 다음 페이지를 가져오는 중인지 여부 */
  isFetchingNextPage: boolean;
  /** 다음 페이지를 가져오는 함수 */
  fetchNextPage: () => void;
  /** IntersectionObserver threshold (default: 0.1) */
  threshold?: number;
}

/**
 * IntersectionObserver 기반 무한 스크롤 훅
 *
 * @param options - 무한 스크롤 옵션
 * @returns 감시할 요소에 연결할 ref
 *
 * @example
 * ```tsx
 * const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(...);
 * const loadMoreRef = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
 *
 * return (
 *   <div>
 *     {data.pages.map(page => ...)}
 *     <div ref={loadMoreRef} /> // 이 요소가 보이면 다음 페이지 로드
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseInfiniteScrollOptions
): RefObject<T | null> {
  const { hasNextPage, isFetchingNextPage, fetchNextPage, threshold = 0.1 } = options;
  const targetRef = useRef<T | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
    });

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, threshold]);

  return targetRef;
}
