"use server";

import { createScheduleRecord } from "#mutations/schedule/dal/scheduleDal";
import { scheduleSchema, type ScheduleFormInput } from "#mutations/schedule/schemas/schedule";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";

export async function createSchedule(input: ScheduleFormInput) {
  const adminUser = await requireAdminUser();
  const parsed = scheduleSchema.parse(input);

  return await createScheduleRecord({
    ...parsed,
    createdBy: adminUser.id,
  });
}
