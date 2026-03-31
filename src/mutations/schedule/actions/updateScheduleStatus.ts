"use server";

import { updateScheduleRecordStatus } from "#mutations/schedule/dal/scheduleDal";
import {
  normalizeUpdateScheduleStatusInput,
  updateScheduleStatusSchema,
  type UpdateScheduleStatusInput,
} from "#mutations/schedule/schemas/updateScheduleStatus";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";

export async function updateScheduleStatus(input: UpdateScheduleStatusInput | FormData) {
  await requireAdminUser();

  const parsed = updateScheduleStatusSchema.parse(normalizeUpdateScheduleStatusInput(input));
  return await updateScheduleRecordStatus(parsed);
}