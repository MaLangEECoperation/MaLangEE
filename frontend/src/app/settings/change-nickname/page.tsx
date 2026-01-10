"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  AuthGuard,
  type NicknameUpdateFormData,
  nicknameUpdateSchema,
  useCurrentUser,
  useNicknameCheck,
  useUpdateNickname,
} from "@/features/auth";
import { FullLayout } from "@/shared/ui/FullLayout";

export default function ChangeNicknamePage() {
  const [validationError, setValidationError] = useState<string | null>(null);
  const { data: currentUser } = useCurrentUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NicknameUpdateFormData>({
    resolver: zodResolver(nicknameUpdateSchema),
  });

  const watchNewNickname = watch("new_nickname");

  // 현재 사용자 닉네임을 기존 닉네임 필드에 자동 설정
  useEffect(() => {
    if (currentUser?.nickname) {
      setValue("current_nickname", currentUser.nickname);
    } else if (currentUser) {
      // 닉네임이 없는 경우 login_id 사용
      setValue("current_nickname", currentUser.login_id);
    }
  }, [currentUser, setValue]);

  // 새로운 닉네임 중복 확인 훅
  const nicknameCheck = useNicknameCheck(watchNewNickname);

  // 닉네임 변경 mutation
  const updateNicknameMutation = useUpdateNickname();

  const onSubmit = (data: NicknameUpdateFormData) => {
    setValidationError(null);

    // 현재 닉네임과 새로운 닉네임이 같은지 확인
    if (data.current_nickname === data.new_nickname) {
      setValidationError("기존 닉네임과 동일합니다");
      return;
    }

    // 유효성 검사 오류가 있는지 확인
    if (nicknameCheck.error) {
      setValidationError("새로운 닉네임을 확인해주세요");
      return;
    }

    // 중복 체크가 완료되지 않았거나 사용 불가능한 경우
    if (!nicknameCheck.isAvailable) {
      setValidationError("새로운 닉네임을 확인해주세요");
      return;
    }

    updateNicknameMutation.mutate(data, {
      onError: (error) => {
        if (error instanceof Error) {
          const message = error.message;
          if (message.includes("이미")) {
            setValidationError(message);
          } else {
            setValidationError("닉네임 변경에 실패했습니다. 입력 정보를 확인해주세요.");
          }
        }
      },
    });
  };

  const isSubmitDisabled =
    updateNicknameMutation.isPending ||
    nicknameCheck.isChecking ||
    !!nicknameCheck.error ||
    !nicknameCheck.isAvailable;

  return (
    <AuthGuard>
      <FullLayout showHeader={true} maxWidth="md:max-w-[360px]">
        <div className="w-full space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold leading-snug md:text-4xl">닉네임 변경</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* 기존 닉네임 입력 (읽기 전용) */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-[#1F1C2B]"
              style={{ letterSpacing: "-0.2px" }}
            >
              기존 닉네임
            </label>
            <div className="relative">
              <input
                id="current_nickname"
                type="text"
                placeholder="기존 닉네임"
                {...register("current_nickname")}
                readOnly
                className="h-[56px] w-full cursor-not-allowed rounded-full border border-[#d4d0df] bg-gray-100 px-5 text-base text-[#1F1C2B] shadow-[0_2px_6px_rgba(0,0,0,0.03)] placeholder:text-[#8c869c]"
                style={{ letterSpacing: "-0.2px" }}
              />
              {errors.current_nickname && (
                <p className="mt-2 px-1 text-sm text-red-500">{errors.current_nickname.message}</p>
              )}
            </div>
          </div>

          {/* 새로운 닉네임 입력 */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium text-[#1F1C2B]"
              style={{ letterSpacing: "-0.2px" }}
            >
              새로운 닉네임
            </label>
            <div className="relative">
              <input
                id="new_nickname"
                type="text"
                placeholder="새로운 닉네임을 입력해주세요"
                {...register("new_nickname")}
                className="h-[56px] w-full rounded-full border border-[#d4d0df] bg-white px-5 text-base text-[#1F1C2B] shadow-[0_2px_6px_rgba(0,0,0,0.03)] placeholder:text-[#8c869c] focus:border-[#7B6CF6] focus:outline-none focus:ring-2 focus:ring-[#cfc5ff]"
                style={{ letterSpacing: "-0.2px" }}
              />
              {nicknameCheck.isChecking && (
                <p className="mt-2 px-1 text-sm text-blue-500">확인 중...</p>
              )}
              {errors.new_nickname && (
                <p className="mt-2 px-1 text-sm text-red-500">{errors.new_nickname.message}</p>
              )}
              {nicknameCheck.error && !errors.new_nickname && (
                <p className="mt-2 px-1 text-sm text-red-500">{nicknameCheck.error}</p>
              )}
              {!nicknameCheck.isChecking &&
                !nicknameCheck.error &&
                nicknameCheck.isAvailable &&
                watchNewNickname && (
                  <p className="mt-2 px-1 text-sm text-green-600">사용 가능한 닉네임입니다</p>
                )}
            </div>
          </div>

          {validationError && (
            <p className="px-1 text-sm text-red-500" style={{ letterSpacing: "-0.1px" }}>
              *{validationError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="h-[56px] w-full rounded-full text-base font-semibold shadow-[0_10px_30px_rgba(118,102,245,0.15)] transition enabled:bg-[#7B6CF6] enabled:text-white enabled:hover:bg-[#6B5CE6] disabled:cursor-not-allowed disabled:bg-[#d4d0df] disabled:text-[#8c869c] disabled:opacity-60"
          >
            {updateNicknameMutation.isPending ? "변경 중..." : "변경하기"}
          </button>

          <p className="text-center text-sm text-[#625a75]" style={{ letterSpacing: "-0.1px" }}>
            <Link href="/topic-select" className="font-semibold text-[#7B6CF6] hover:underline">
              취소
            </Link>
          </p>
        </form>
        </div>
      </FullLayout>
    </AuthGuard>
  );
}
