"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { type LoginFormData, loginSchema, useLogin } from "@/features/auth";
import { Button, SplitViewLayout } from "@/shared";

import { defaultLoginContents } from "../config";
import type { LoginPageContents } from "../model";

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

export interface LoginPageProps {
  contents?: LoginPageContents;
}

export function LoginPage({ contents = defaultLoginContents }: LoginPageProps) {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [activeTitleIndex, setActiveTitleIndex] = useState(0);
  const titleRotationMs = 4000;

  const titleMessages = contents.titleMessages;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTitleIndex((prev) => (prev + 1) % titleMessages.length);
    }, titleRotationMs);

    return () => clearInterval(interval);
  }, [titleMessages.length, titleRotationMs]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: loginResolver,
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    // 방어적 유효성 검증(콘솔 에러 방지)
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
    <div className="mb-10 w-full space-y-7  md:space-y-9">
      <div className="space-y-2" id={"title-wrapper"} key={activeTitleIndex}>
        <p
          className="text-brand title-rotate mb-4 text-xl font-medium"
          style={{ letterSpacing: "-0.2px" }}
        >
          {titleMessages[activeTitleIndex].top}
        </p>
        <h1
          className="title-rotate text-text-primary text-4xl font-bold leading-snug tracking-tight"
          style={{ letterSpacing: "-0.96px" }}
        >
          {titleMessages[activeTitleIndex].headingLine1}
          <br />
          {titleMessages[activeTitleIndex].headingLine2}
        </h1>
      </div>

      <div
        id="icon-wrapper"
        className="flex w-full items-center justify-center gap-2 md:justify-start"
      >
        {titleMessages.map((_, index) => (
          <div
            key={index}
            onClick={() => setActiveTitleIndex(index)}
            className={
              index === activeTitleIndex
                ? "bg-brand h-3 w-10 cursor-pointer rounded-full transition-all duration-300"
                : "h-3 w-3 cursor-pointer rounded-full bg-white/90 transition-all duration-300"
            }
          />
        ))}
      </div>
    </div>
  );

  // 오른쪽 콘텐츠(로그인 폼)
  const rightContent = (
    <div className="mx-auto w-full space-y-7 md:space-y-9">
      <p className="text-text-primary text-3xl font-semibold leading-snug md:text-4xl">
        {contents.greeting.line1}
        <br />
        {contents.greeting.line2}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 md:gap-6 ">
        <div className="flex flex-col gap-4 md:gap-5">
          <div className="relative">
            <input
              id="username"
              type="text"
              placeholder={contents.form.emailPlaceholder}
              {...register("username")}
              className="border-border text-text-primary placeholder:text-muted-foreground focus:border-brand focus:ring-brand-200 bg-background h-[56px] w-full rounded-full border px-5 text-base lowercase focus:outline-none focus:ring-2"
              style={{ letterSpacing: "-0.2px" }}
            />
            {errors.username && (
              <p className="mt-2 whitespace-nowrap px-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              id="password"
              type="password"
              placeholder={contents.form.passwordPlaceholder}
              {...register("password")}
              className="border-border text-text-primary placeholder:text-muted-foreground focus:border-brand focus:ring-brand-200 bg-background h-[56px] w-full rounded-full border px-5 text-base focus:outline-none focus:ring-2"
              style={{ letterSpacing: "-0.2px" }}
            />
            {errors.password && (
              <p className="mt-2 whitespace-nowrap px-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <div className="text-text-secondary flex flex-row items-center justify-between gap-3 px-1 text-sm">
          <a
            href="#"
            onClick={handleFindClick}
            className="hover:text-brand"
            style={{ letterSpacing: "-0.1px" }}
          >
            {contents.form.findCredentials}
          </a>
          <Link
            href="/auth/signup"
            className="hover:text-brand font-medium"
            style={{ letterSpacing: "-0.1px" }}
          >
            {contents.form.signupLink}
          </Link>
        </div>

        {loginMutation.isError && (
          <p className="whitespace-nowrap px-1 text-center text-sm text-red-500">
            {loginMutation.error.message || contents.form.loginError}
          </p>
        )}

        <div className="flex flex-col gap-4 md:gap-5">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loginMutation.isPending}
          >
            {loginMutation.isPending ? contents.form.loginPending : contents.form.loginButton}
          </Button>

          <Button asChild variant="outline-purple" size="lg" fullWidth>
            <Link href="/scenario-select">{contents.form.tryNowButton}</Link>
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
        maxWidth="md:max-w-5xl"
        leftColSpan={6}
        rightColSpan={6}
        glassClassName="p-6 md:p-10"
        glassMaxWidth="max-w-full md:max-w-2xl lg:max-w-3xl"
      />

      {showComingSoonModal && (
        <div className="bg-dim-light fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-border bg-card relative mx-4 w-full max-w-sm rounded-3xl border shadow-xl backdrop-blur-2xl">
            <div className="space-y-6 px-8 py-8">
              <div className="space-y-2">
                <p className="text-text-primary text-center text-2xl font-semibold">
                  {contents.comingSoon.title}
                </p>
                <p
                  className="text-text-secondary whitespace-pre-line text-center text-sm"
                  style={{ letterSpacing: "-0.1px" }}
                >
                  {contents.comingSoon.description}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setShowComingSoonModal(false)}
              >
                {contents.comingSoon.confirmButton}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
