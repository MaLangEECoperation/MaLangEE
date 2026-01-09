import { apiClient } from "../lib/api-client";
import type { Token, User, DuplicateCheckResponse } from "../types/api";

export const authApi = {
  register: async (email: string, username: string, password: string): Promise<User> => {
    return apiClient.post<User>("/auth/register", {
      email,
      username,
      password,
    });
  },

  login: async (email: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Login failed");
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

