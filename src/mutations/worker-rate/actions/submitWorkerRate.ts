"use server";

import { revalidateTag } from "next/cache";

import { upsertWorkerRate } from "#mutations/worker-rate/actions/upsertWorkerRate";
import { cacheTags } from "#shared/config/cacheTags";

export async function submitWorkerRate(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const hourlyRateCents = Number(formData.get("hourlyRateCents"));

  await upsertWorkerRate({ userId, hourlyRateCents });
  revalidateTag(cacheTags.assignments.workerPayPreview(userId), "max");
}
