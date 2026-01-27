import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { signup } from "../api/signup/signup";
import type { RegisterFormData } from "../model";

/**
 * 회원가입 mutation hook
 * 성공 시: /auth/login으로 이동
 */
export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationKey: ["auth", "signup"],
    mutationFn: (data: RegisterFormData) =>
      signup({
        login_id: data.login_id,
        nickname: data.nickname,
        password: data.password,
      }),
    onSuccess: () => {
      router.push("/auth/login");
    },
  });
}
