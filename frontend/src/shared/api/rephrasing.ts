import { apiClient } from "../lib/api-client";
import type { Rephrasing, RephrasingCreate, RephrasingSentence } from "../type/api";

export const rephrasingApi = {
  getSentence: async (): Promise<RephrasingSentence> => {
    return apiClient.get<RephrasingSentence>("/api/v1/rephrasing/sentence");
  },

  create: async (data: RephrasingCreate): Promise<Rephrasing> => {
    return apiClient.post<Rephrasing>("/api/v1/rephrasing", data);
  },

  getAll: async (skip = 0, limit = 10): Promise<Rephrasing[]> => {
    return apiClient.get<Rephrasing[]>(
      `/api/v1/rephrasing?skip=${skip}&limit=${limit}`
    );
  },
};


