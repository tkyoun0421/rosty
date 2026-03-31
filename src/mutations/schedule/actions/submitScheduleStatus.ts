"use server";

import { revalidatePath } from "next/cache";

import { updateScheduleStatus } from "#mutations/schedule/actions/updateScheduleStatus";

export async function submitScheduleStatus(formData: FormData) {
  await updateScheduleStatus(formData);
  revalidatePath("/admin/schedules");
}
