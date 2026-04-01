"use server";

import { revalidateTag } from "next/cache";

import { updateScheduleStatus } from "#mutations/schedule/actions/updateScheduleStatus";
import { cacheTags } from "#shared/config/cacheTags";

export async function submitScheduleStatus(formData: FormData) {
  await updateScheduleStatus(formData);
  revalidateTag(cacheTags.schedules.all, "max");
  revalidateTag(cacheTags.schedules.adminList, "max");
  revalidateTag(cacheTags.schedules.recruitingList, "max");
  revalidateTag(cacheTags.dashboard.all, "max");
  revalidateTag(cacheTags.dashboard.adminOperations, "max");
}