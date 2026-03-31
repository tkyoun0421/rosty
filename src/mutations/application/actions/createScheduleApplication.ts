"use server";

import { z } from "zod";

import {
  getRecruitingScheduleById,
  insertScheduleApplication,
  type ScheduleApplicationRecord,
} from "#mutations/application/dal/scheduleApplicationDal";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";

const createScheduleApplicationSchema = z
  .object({
    scheduleId: z.string().trim().min(1),
  })
  .strip();

export type CreateScheduleApplicationInput = z.input<typeof createScheduleApplicationSchema>;

export type CreateScheduleApplicationResult =
  | {
      status: "applied";
      application: ScheduleApplicationRecord;
    }
  | {
      status: "already_applied";
    };

export async function createScheduleApplication(
  input: CreateScheduleApplicationInput,
): Promise<CreateScheduleApplicationResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    throw new Error("FORBIDDEN");
  }

  const parsed = createScheduleApplicationSchema.parse(input);
  const schedule = await getRecruitingScheduleById(parsed.scheduleId);

  if (!schedule) {
    throw new Error("SCHEDULE_NOT_RECRUITING");
  }

  try {
    const application = await insertScheduleApplication({
      scheduleId: parsed.scheduleId,
      workerUserId: currentUser.id,
    });

    return {
      status: "applied",
      application,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_APPLIED") {
      return {
        status: "already_applied",
      };
    }

    throw error;
  }
}
