import { useEffect } from "react";

/**
 * 마운트 시 지정된 폼 필드에 자동으로 포커스를 설정하는 훅
 *
 * react-hook-form의 setFocus와 함께 사용합니다.
 *
 * @param setFocus - react-hook-form의 setFocus 함수
 * @param fieldName - 포커스할 필드명
 *
 * @example
 * ```tsx
 * const { setFocus } = useForm();
 * useAutoFocus(setFocus, 'email');
 * ```
 */
export function useAutoFocus(setFocus: (name: string) => void, fieldName: string): void {
  useEffect(() => {
    setFocus(fieldName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
