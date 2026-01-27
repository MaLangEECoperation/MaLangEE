import { useMemo } from "react";

import type { MalangEEStatus } from "@/shared";

interface UseMalangEEStatusOptions {
  /** 사용자 발화 텍스트 */
  userTranscript: string | null;
  /** 힌트 프롬프트 표시 여부 */
  showHintPrompt: boolean;
  /** AI가 말하는 중인지 여부 */
  isAiSpeaking: boolean;
}

/**
 * MalangEE 캐릭터 상태를 결정하는 훅
 *
 * 우선순위:
 * 1. sad: 언어 인식 실패 ([unintelligible])
 * 2. humm: 힌트 프롬프트 표시 중
 * 3. talking: AI가 말하는 중
 * 4. default: 기본 상태
 *
 * @param options - 상태 결정 옵션
 * @returns MalangEEStatus
 *
 * @example
 * ```tsx
 * const status = useMalangEEStatus({
 *   userTranscript: state.userTranscript,
 *   showHintPrompt,
 *   isAiSpeaking: state.isAiSpeaking,
 * });
 *
 * <MalangEE status={status} />
 * ```
 */
export function useMalangEEStatus(options: UseMalangEEStatusOptions): MalangEEStatus {
  const { userTranscript, showHintPrompt, isAiSpeaking } = options;

  return useMemo(() => {
    // 언어 인식 실패
    if (userTranscript?.toLowerCase().includes("[unintelligible]")) {
      return "sad";
    }

    // 힌트 표시 중
    if (showHintPrompt) {
      return "humm";
    }

    // AI가 말하는 중
    if (isAiSpeaking) {
      return "talking";
    }

    // 기본 상태
    return "default";
  }, [userTranscript, showHintPrompt, isAiSpeaking]);
}
