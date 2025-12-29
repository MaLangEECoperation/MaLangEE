import { apiClient } from "../lib/api-client";
import type { QuickResponse, QuickResponseCreate, QuickResponseScenario } from "../type/api";

export const quickResponseApi = {
  getScenario: async (): Promise<QuickResponseScenario> => {
    return apiClient.get<QuickResponseScenario>("/api/v1/quick-response/scenario");
  },

  create: async (data: QuickResponseCreate): Promise<QuickResponse> => {
    return apiClient.post<QuickResponse>("/api/v1/quick-response", data);
  },

  getAll: async (skip = 0, limit = 10): Promise<QuickResponse[]> => {
    return apiClient.get<QuickResponse[]>(
      `/api/v1/quick-response?skip=${skip}&limit=${limit}`
    );
  },
};


