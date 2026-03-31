"use server";

import { revalidatePath } from "next/cache";

import { createSchedule } from "#mutations/schedule/actions/createSchedule";
import type { ScheduleFormInput } from "#mutations/schedule/schemas/schedule";

function getRoleSlots(formData: FormData): ScheduleFormInput["roleSlots"] {
  const roleCodes = formData.getAll("roleCode").map((value) => String(value ?? ""));
  const headcounts = formData.getAll("headcount").map((value) => String(value ?? ""));

  return roleCodes.map((roleCode, index) => ({
    roleCode,
    headcount: headcounts[index] ?? "",
  }));
}

export async function submitSchedule(formData: FormData) {
  await createSchedule({
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    endTime: String(formData.get("endTime") ?? ""),
    roleSlots: getRoleSlots(formData),
  });

  revalidatePath("/admin/schedules");
}
