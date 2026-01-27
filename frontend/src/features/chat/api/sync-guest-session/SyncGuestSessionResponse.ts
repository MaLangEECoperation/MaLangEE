import { z } from "zod";

export const syncGuestSessionResponseSchema = z.object({
  status: z.string(),
  session_id: z.string(),
});

export type SyncGuestSessionResponse = z.infer<typeof syncGuestSessionResponseSchema>;
