import { z } from "zod";

export const syncGuestSessionParamsSchema = z.object({
  sessionId: z.string().min(1, "sessionId는 필수입니다"),
});

export type SyncGuestSessionParams = z.infer<typeof syncGuestSessionParamsSchema>;
