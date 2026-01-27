"use client";

import { useState, useEffect, useRef } from "react";

import { AUTH_VALIDATION } from "../config";
import { registerSchema } from "./schema";

interface UsePasswordValidationOptions {
  /** 디바운스 지연 시간 (ms) */
  debounceMs?: number;
  /** 최소 입력 길이 */
  minLength?: number;
}

interface UsePasswordValidationResult {
  /** 에러 메시지 (null이면 에러 없음) */
  error: string | null;
  /** 검증 중 여부 */
  isChecking: boolean;
  /** 유효 여부 (null이면 아직 검증 안됨) */
  isValid: boolean | null;
}

/**
 * 비밀번호 유효성 검사 훅
 *
 * registerSchema의 password 규칙을 사용하여 클라이언트 측 유효성을 검사합니다.
 *
 * @param value - 검증할 비밀번호
 * @param options - 옵션 (debounceMs, minLength)
 * @returns { error, isChecking, isValid }
 *
 * @example
 * ```tsx
 * const { error, isChecking, isValid } = usePasswordValidation(password);
 *
 * {isChecking && <Spinner />}
 * {error && <ErrorMessage>{error}</ErrorMessage>}
 * {isValid && <SuccessMessage>유효한 비밀번호입니다</SuccessMessage>}
 * ```
 */
export function usePasswordValidation(
  value: string,
  options: UsePasswordValidationOptions = {}
): UsePasswordValidationResult {
  const {
    debounceMs = AUTH_VALIDATION.PASSWORD.DEBOUNCE_MS,
    minLength = AUTH_VALIDATION.PASSWORD.MIN_LENGTH,
  } = options;

  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // 단순 초기화
    if (!value || value.length < minLength) {
      setError(null);
      setIsValid(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(() => {
      try {
        // registerSchema의 password 규칙만 사용
        const pwdSchema = registerSchema.pick({ password: true });
        const parsed = pwdSchema.safeParse({ password: value });
        if (!mountedRef.current) return;

        if (!parsed.success) {
          const msg = parsed.error.issues[0]?.message || "비밀번호 형식이 올바르지 않습니다";
          setError(String(msg));
          setIsValid(false);
        } else {
          setError(null);
          setIsValid(true);
        }
      } catch (e) {
        console.error("비밀번호 검증 오류:", e);
        setError("비밀번호 검증 중 오류가 발생했습니다");
        setIsValid(null);
      } finally {
        if (mountedRef.current) setIsChecking(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, debounceMs, minLength]);

  return { error, isChecking, isValid };
}
