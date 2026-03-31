import { z } from "zod";

export const workerRateSchema = z.object({
  userId: z.string().min(1),
  hourlyRateCents: z.number().int().positive(),
});

export type WorkerRateInput = z.infer<typeof workerRateSchema>;
