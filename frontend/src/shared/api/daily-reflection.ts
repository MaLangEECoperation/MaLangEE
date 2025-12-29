import { apiClient } from "../lib/api-client";
import type { DailyReflection, DailyReflectionCreate } from "../types/api";

export const dailyReflectionApi = {
  create: async (data: DailyReflectionCreate): Promise<DailyReflection> => {
    return apiClient.post<DailyReflection>("/api/v1/daily-reflection", data);
  },

  getAll: async (skip = 0, limit = 10): Promise<DailyReflection[]> => {
    return apiClient.get<DailyReflection[]>(
      `/api/v1/daily-reflection?skip=${skip}&limit=${limit}`
    );
  },

  getById: async (id: number): Promise<DailyReflection> => {
    return apiClient.get<DailyReflection>(`/api/v1/daily-reflection/${id}`);
  },
};

