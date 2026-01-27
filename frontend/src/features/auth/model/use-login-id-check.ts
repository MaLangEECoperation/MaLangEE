"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { checkLoginId } from "../api/check-login-id/check-login-id";
import { AUTH_VALIDATION } from "../config";

interface UseLoginIdCheckOptions {
  /** 디바운스 지연 시간 (ms) */
  debounceMs?: number;
  /** 최소 입력 길이 */
  minLength?: number;
}

interface UseLoginIdCheckResult {
  /** 에러 메시지 (null이면 에러 없음) */
  error: string | null;
  /** 확인 중 여부 */
  isChecking: boolean;
  /** 사용 가능 여부 (null이면 아직 확인 안됨) */
  isAvailable: boolean | null;
  /** 즉시 확인 실행 */
  trigger: () => void;
}

/**
 * 로그인 ID 중복 확인 훅
 *
 * @param value - 확인할 로그인 ID
 * @param options - 옵션 (debounceMs, minLength)
 * @returns { error, isChecking, isAvailable, trigger }
 *
 * @example
 * ```tsx
 * const { error, isChecking, isAvailable } = useLoginIdCheck(email);
 *
 * {isChecking && <Spinner />}
 * {error && <ErrorMessage>{error}</ErrorMessage>}
 * {isAvailable && <SuccessMessage>사용 가능합니다</SuccessMessage>}
 * ```
 */
export function useLoginIdCheck(
  value: string,
  options: UseLoginIdCheckOptions = {}
): UseLoginIdCheckResult {
  const {
    debounceMs = AUTH_VALIDATION.LOGIN_ID.DEBOUNCE_MS,
    minLength = AUTH_VALIDATION.LOGIN_ID.MIN_LENGTH,
  } = options;

  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const runCheck = useCallback(
    async (val: string, signal: AbortSignal) => {
      if (!val || val.length < minLength) {
        setError(null);
        setIsAvailable(null);
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      try {
        const result = await checkLoginId(val);
        if (signal.aborted) return;

        setIsAvailable(result.is_available);
        setError(result.is_available ? null : "이미 사용중인 이메일입니다");
      } catch (error) {
        if (signal.aborted) return;

        console.error("이메일 중복 확인 오류:", error);

        let errorMessage = "이메일 확인 중 오류가 발생했습니다";
        if (error instanceof Error) {
          if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
            errorMessage = "서버에 연결할 수 없습니다. 네트워크를 확인해주세요.";
          } else {
            errorMessage = error.message || errorMessage;
          }
        }

        setError(errorMessage);
        setIsAvailable(null);
      } finally {
        if (!signal.aborted) {
          setIsChecking(false);
        }
      }
    },
    [minLength]
  );

  const trigger = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    runCheck(value, abortController.signal);
  };

  useEffect(() => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 값이 없거나 최소 길이 미달이면 초기화
    if (!value || value.length < minLength) {
      setError(null);
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    timerRef.current = setTimeout(() => {
      runCheck(value, abortController.signal);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortController.abort();
    };
  }, [value, debounceMs, minLength, runCheck]);

  return { error, isChecking, isAvailable, trigger };
}
