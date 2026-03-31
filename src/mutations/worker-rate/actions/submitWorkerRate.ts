"use server";

import { upsertWorkerRate } from "#mutations/worker-rate/actions/upsertWorkerRate";

export async function submitWorkerRate(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const hourlyRateCents = Number(formData.get("hourlyRateCents"));

  await upsertWorkerRate({ userId, hourlyRateCents });
}
