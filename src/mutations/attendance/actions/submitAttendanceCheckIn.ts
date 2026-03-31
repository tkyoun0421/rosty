"use server";

import { revalidateTag } from "next/cache";

import { createAttendanceCheckIn } from "#mutations/attendance/actions/createAttendanceCheckIn";
import { parseSubmitAttendanceCheckInFormData } from "#mutations/attendance/schemas/attendanceCheckIn";
import { cacheTags } from "#shared/config/cacheTags";

export async function submitAttendanceCheckIn(formData: FormData) {
  const result = await createAttendanceCheckIn(parseSubmitAttendanceCheckInFormData(formData));

  if (result.status === "success") {
    revalidateTag(cacheTags.attendance.all, "max");
    revalidateTag(cacheTags.attendance.worker(result.attendance.workerUserId), "max");
    revalidateTag(cacheTags.attendance.scheduleDetail(result.attendance.scheduleId), "max");
    revalidateTag(cacheTags.assignments.workerConfirmed(result.attendance.workerUserId), "max");
  }

  return result;
}