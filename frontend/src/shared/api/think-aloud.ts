import { apiClient } from "../lib/api-client";
import type { ThinkAloud, ThinkAloudCreate, ThinkAloudTopic } from "../types/api";

export const thinkAloudApi = {
  getTopic: async (): Promise<ThinkAloudTopic> => {
    return apiClient.get<ThinkAloudTopic>("/api/v1/think-aloud/topic");
  },

  create: async (data: ThinkAloudCreate): Promise<ThinkAloud> => {
    return apiClient.post<ThinkAloud>("/api/v1/think-aloud", data);
  },

  getAll: async (skip = 0, limit = 10): Promise<ThinkAloud[]> => {
    return apiClient.get<ThinkAloud[]>(
      `/api/v1/think-aloud?skip=${skip}&limit=${limit}`
    );
  },
};


