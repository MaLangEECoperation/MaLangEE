import { apiClient } from "../lib/api-client";
import { config } from "../lib/config";
import type { Token, User, DuplicateCheckResponse } from "../types/api";

export const authApi = {
  register: async (login_id: string, nickname: string, password: string): Promise<User> => {
    return apiClient.post<User>("/auth/signup", {
      login_id,
      nickname,
      password,
      is_active: true,
    });
  },

  login: async (username: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append("grant_type", "");
    formData.append("username", username);
    formData.append("password", password);
    formData.append("scope", "");
    formData.append("client_id", "");
    formData.append("client_secret", "");

    return fetch(`${config.apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "accept": "application/json",
      },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        // 400: 로그인 실패 (아이디/비밀번호 불일치)
        if (res.status === 400) {
          throw new Error(errorData.detail || "아이디 또는 비밀번호가 올바르지 않습니다");
        }

        // 422: 유효성 검사 오류
        if (res.status === 422 && errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => err.msg).join(", ");
          throw new Error(validationErrors || "입력 정보를 확인해주세요");
        }

        throw new Error(errorData.detail || "로그인에 실패했습니다");
      }
      return res.json();
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>("/users/me");
  },

  checkLoginId: async (login_id: string): Promise<DuplicateCheckResponse> => {
    return apiClient.post<DuplicateCheckResponse>("/auth/check-login-id", {
      login_id,
    });
  },

  checkNickname: async (nickname: string): Promise<DuplicateCheckResponse> => {
    return apiClient.post<DuplicateCheckResponse>("/auth/check-nickname", {
      nickname,
    });
  },
};

