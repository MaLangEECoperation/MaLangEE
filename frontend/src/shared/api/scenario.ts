import { apiClient } from "../lib/api-client";
import type { Scenario, ScenarioCreate, ScenarioType } from "../type/api";

export const scenarioApi = {
  getTypes: async (): Promise<ScenarioType[]> => {
    return apiClient.get<ScenarioType[]>("/api/v1/scenario/types");
  },

  create: async (data: ScenarioCreate): Promise<Scenario> => {
    return apiClient.post<Scenario>("/api/v1/scenario", data);
  },

  addMessage: async (scenarioId: number, message: string): Promise<Scenario> => {
    return apiClient.post<Scenario>(`/api/v1/scenario/${scenarioId}/message`, {
      message,
    });
  },

  getAll: async (skip = 0, limit = 10): Promise<Scenario[]> => {
    return apiClient.get<Scenario[]>(`/api/v1/scenario?skip=${skip}&limit=${limit}`);
  },

  getById: async (scenarioId: number): Promise<Scenario> => {
    return apiClient.get<Scenario>(`/api/v1/scenario/${scenarioId}`);
  },
};


