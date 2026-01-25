import { z } from "zod";

import { chatSessionDetailSchema } from "../../model/schemas";

export const getRecentSessionResponseSchema = z.union([chatSessionDetailSchema, z.null()]);

export type GetRecentSessionResponse = z.infer<typeof getRecentSessionResponseSchema>;
