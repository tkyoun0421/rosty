"use server";

import { revalidateTag } from "next/cache";

import { createScheduleApplication } from "#mutations/application/actions/createScheduleApplication";
import { parseSubmitScheduleApplicationFormData } from "#mutations/application/schemas/submitScheduleApplication";
import { cacheTags } from "#shared/config/cacheTags";

export async function submitScheduleApplication(formData: FormData) {
  const parsed = parseSubmitScheduleApplicationFormData(formData);
  const result = await createScheduleApplication(parsed);

  if (result.status === "applied") {
    revalidateTag(cacheTags.applications.all, "max");
    revalidateTag(cacheTags.applications.workerScheduleIds, "max");
    revalidateTag(cacheTags.schedules.recruitingList, "max");
    revalidateTag(cacheTags.assignments.detail(parsed.scheduleId), "max");
    revalidateTag(cacheTags.dashboard.all, "max");
    revalidateTag(cacheTags.dashboard.adminOperations, "max");
  }

  return result;
}
