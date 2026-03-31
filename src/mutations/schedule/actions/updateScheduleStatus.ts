"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateScheduleRecordStatus } from "#mutations/schedule/dal/scheduleDal";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";

const scheduleStatusSchema = z.enum(["recruiting", "assigning", "confirmed"]);

const updateScheduleStatusSchema = z.object({
  scheduleId: z.string().trim().min(1),
  status: scheduleStatusSchema,
});

export type UpdateScheduleStatusInput = z.input<typeof updateScheduleStatusSchema>;

function normalizeUpdateScheduleStatusInput(
  input: UpdateScheduleStatusInput | FormData,
): UpdateScheduleStatusInput {
  if (input instanceof FormData) {
    return {
      scheduleId: String(input.get("scheduleId") ?? ""),
      status: String(input.get("status") ?? "") as UpdateScheduleStatusInput["status"],
    };
  }

  return input;
}

export async function updateScheduleStatus(input: UpdateScheduleStatusInput | FormData) {
  await requireAdminUser();

  const parsed = updateScheduleStatusSchema.parse(normalizeUpdateScheduleStatusInput(input));
  const updatedSchedule = await updateScheduleRecordStatus(parsed);

  revalidatePath("/admin/schedules");

  return updatedSchedule;
}
