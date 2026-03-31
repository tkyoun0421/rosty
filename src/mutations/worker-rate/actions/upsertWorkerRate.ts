"use server";

import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { upsertWorkerRateRecord } from "#mutations/worker-rate/dal/workerRateDal";
import { workerRateSchema } from "#mutations/worker-rate/schemas/workerRate";

export async function upsertWorkerRate(input: { userId: string; hourlyRateCents: number }) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  const parsed = workerRateSchema.parse(input);

  await upsertWorkerRateRecord({
    userId: parsed.userId,
    hourlyRateCents: parsed.hourlyRateCents,
    updatedBy: currentUser.id,
  });

  return parsed;
}

