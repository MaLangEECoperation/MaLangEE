"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { useState } from "react";
import { SplitViewLayout } from "@/shared/ui/SplitViewLayout";
import { Button } from "@/shared/ui";
import { type LoginFormData, loginSchema, useLogin } from "@/features/auth";

// safeParse를 사용하는 커스텀 resolver (콘솔 에러 방지)
const loginResolver: Resolver<LoginFormData> = async (values) => {
  const result = loginSchema.safeParse(values);

  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors: Record<string, { type: string; message: string }> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (path) {
      errors[path] = {
        type: issue.code,
        message: issue.message,
      };
    }
  });

  return { values: {}, errors };
};

export default function LoginPage() {
  const router = useRouter();
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: loginResolver,
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    // 방어적 유효성 검사 (콘솔 에러 방지)
    const result = loginSchema.safeParse(data);
    if (!result.success) return;

    loginMutation.mutate(data);
  };

  const handleFindClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowComingSoonModal(true);
  };

  // 왼쪽 콘텐츠
  const leftContent = (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xl text-brand-700" style={{ letterSpacing: "-0.2px" }}>
          Free Talking AI Chat-bot
        </p>
        <h1
          className="text-3xl font-bold leading-snug tracking-tight"
          style={{ letterSpacing: "-0.96px" }}
        >
          해외 원어민과
          <br />
          대화하는 느낌 그대로!
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-3 w-10 rounded-full bg-brand" />
        <div className="h-3 w-3 rounded-full bg-white/90" />
        <div className="h-3 w-3 rounded-full bg-white/90" />
      </div>
    </div>
  );

  // 오른쪽 콘텐츠 (로그인 폼)
  const rightContent = (
    <div className="w-full max-w-md space-y-8">
      <p className="text-3xl font-semibold leading-snug md:text-4xl">
        Hello,
        <br />
        I&#39;m MalangEE
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col  gap-4">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              id="username"
              type="text"
              placeholder="아이디"
              {...register("username")}
              className="h-[56px] w-full rounded-full border border-border-light bg-white px-5 text-base text-text-primary shadow-[0_2px_6px_rgba(0,0,0,0.03)] placeholder:text-placeholder focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-200"
              style={{ letterSpacing: "-0.2px" }}
            />
            {errors.username && (
              <p className="mt-2 px-1 text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              {...register("password")}
              className="h-[56px] w-full rounded-full border border-border-light bg-white px-5 text-base text-text-primary shadow-[0_2px_6px_rgba(0,0,0,0.03)] placeholder:text-placeholder focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-200"
              style={{ letterSpacing: "-0.2px" }}
            />
            {errors.password && (
              <p className="mt-2 px-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-sm text-text-secondary">
          <a
            href="#"
            onClick={handleFindClick}
            className="hover:text-brand"
            style={{ letterSpacing: "-0.1px" }}
          >
            아이디/비밀번호 찾기
          </a>
          <Link
            href="/auth/signup"
            className="hover:text-brand"
            style={{ letterSpacing: "-0.1px" }}
          >
            회원가입
          </Link>
        </div>

        {loginMutation.isError && (
          <p className="px-1 text-center text-sm text-red-500">
            {loginMutation.error instanceof Error
              ? loginMutation.error.message
              : "로그인에 실패했습니다"}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loginMutation.isPending}
          >
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </Button>

          <Button
            type="button"
            variant="outline-purple"
            size="lg"
            fullWidth
            onClick={() => router.push("/auth/scenario-select")}
          >
            바로 대화해보기
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      <SplitViewLayout
        leftChildren={leftContent}
        rightChildren={rightContent}
        showHeader={false}
        maxWidth="md:max-w-[60vw]"
        leftColSpan={5}
        rightColSpan={7}
      />

      {showComingSoonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-sm rounded-[24px] border border-white/60 bg-gradient-to-br from-white/90 via-white/80 to-brand-50/80 shadow-[0_20px_80px_rgba(125,106,246,0.3)] backdrop-blur-2xl">
            <div className="space-y-6 px-8 py-8">
              <div className="space-y-2">
                <p className="text-center text-2xl font-semibold text-text-primary">준비중입니다</p>
                <p
                  className="text-center text-sm text-text-secondary"
                  style={{ letterSpacing: "-0.1px" }}
                >
                  해당 기능은 현재 준비 중입니다.
                  <br />
                  조금만 기다려주세요!
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setShowComingSoonModal(false)}
              >
                확인
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
