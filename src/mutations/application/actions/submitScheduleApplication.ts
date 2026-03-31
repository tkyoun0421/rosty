"use server";

import { revalidateTag } from "next/cache";

import { createScheduleApplication } from "#mutations/application/actions/createScheduleApplication";
import { parseSubmitScheduleApplicationFormData } from "#mutations/application/schemas/submitScheduleApplication";
import { cacheTags } from "#shared/config/cacheTags";

export async function submitScheduleApplication(formData: FormData) {
  await createScheduleApplication(parseSubmitScheduleApplicationFormData(formData));
  revalidateTag(cacheTags.applications.all, "max");
  revalidateTag(cacheTags.applications.workerScheduleIds, "max");
  revalidateTag(cacheTags.schedules.recruitingList, "max");
}