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

export async function updateScheduleStatus(input: UpdateScheduleStatusInput) {
  await requireAdminUser();

  const parsed = updateScheduleStatusSchema.parse(input);
  const updatedSchedule = await updateScheduleRecordStatus(parsed);

  revalidatePath("/admin/schedules");

  return updatedSchedule;
}
