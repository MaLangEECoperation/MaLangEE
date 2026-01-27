import { useEffect, useRef, type RefObject } from "react";

/**
 * 포커스 가능한 요소를 찾기 위한 선택자
 */
const FOCUSABLE_SELECTOR = [
  "a[href]:not([disabled])",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(", ");

interface UseFocusTrapOptions {
  /** 포커스 트랩 활성화 여부 */
  enabled?: boolean;
  /** 마운트 시 첫 번째 포커스 가능 요소에 포커스 */
  initialFocus?: boolean;
  /** 언마운트 시 이전 포커스 요소로 복원 */
  restoreFocus?: boolean;
}

/**
 * 포커스를 특정 컨테이너 내에 가두는 훅
 * 모달, 다이얼로그 등에서 키보드 접근성을 위해 사용
 *
 * @param options 포커스 트랩 옵션
 * @returns 컨테이너에 연결할 ref
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {}
): RefObject<T | null> {
  const { enabled = true, initialFocus = false, restoreFocus = true } = options;

  const containerRef = useRef<T | null>(null);
  const previousActiveElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // 이전 포커스 요소 저장
    if (restoreFocus) {
      previousActiveElementRef.current = document.activeElement;
    }

    // 포커스 가능한 요소들 가져오기
    const getFocusableElements = (): HTMLElement[] => {
      if (!container) return [];
      return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    };

    // 초기 포커스 설정
    if (initialFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Tab 키 이벤트 핸들러
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: 첫 번째 요소에서 마지막으로
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab: 마지막 요소에서 첫 번째로
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);

      // 이전 포커스 요소로 복원
      if (restoreFocus && previousActiveElementRef.current) {
        const element = previousActiveElementRef.current as HTMLElement;
        if (typeof element.focus === "function") {
          element.focus();
        }
      }
    };
  }, [enabled, initialFocus, restoreFocus]);

  return containerRef;
}
