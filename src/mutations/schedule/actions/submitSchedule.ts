"use server";

import { revalidateTag } from "next/cache";

import { createSchedule } from "#mutations/schedule/actions/createSchedule";
import type { ScheduleFormInput } from "#mutations/schedule/schemas/schedule";
import { cacheTags } from "#shared/config/cacheTags";

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

  revalidateTag(cacheTags.schedules.all, "max");
  revalidateTag(cacheTags.schedules.adminList, "max");
  revalidateTag(cacheTags.schedules.recruitingList, "max");
  revalidateTag(cacheTags.dashboard.all, "max");
  revalidateTag(cacheTags.dashboard.adminOperations, "max");
}