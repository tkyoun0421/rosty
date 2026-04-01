"use server";

import { revalidateTag } from "next/cache";

import {
  confirmScheduleAssignmentDraft,
  type ConfirmScheduleAssignmentResult,
} from "#mutations/assignment/dal/assignmentDal";
import {
  parseConfirmScheduleAssignments,
  type ConfirmScheduleAssignmentsInput,
} from "#mutations/assignment/schemas/confirmScheduleAssignments";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { cacheTags } from "#shared/config/cacheTags";

export async function confirmScheduleAssignments(
  input: ConfirmScheduleAssignmentsInput | FormData,
): Promise<ConfirmScheduleAssignmentResult> {
  const adminUser = await requireAdminUser();
  const parsed = parseConfirmScheduleAssignments(input);
  const result = await confirmScheduleAssignmentDraft({
    scheduleId: parsed.scheduleId,
    confirmedBy: adminUser.id,
  });

  revalidateTag(cacheTags.assignments.detail(parsed.scheduleId), "max");
  revalidateTag(cacheTags.assignments.all, "max");
  revalidateTag(cacheTags.schedules.all, "max");
  revalidateTag(cacheTags.schedules.adminList, "max");
  revalidateTag(cacheTags.schedules.recruitingList, "max");
  revalidateTag(cacheTags.dashboard.all, "max");
  revalidateTag(cacheTags.dashboard.adminOperations, "max");

  const workerUserIds = new Set(result.confirmedAssignments.map((assignment) => assignment.workerUserId));

  for (const workerUserId of workerUserIds) {
    revalidateTag(cacheTags.assignments.workerConfirmed(workerUserId), "max");
    revalidateTag(cacheTags.assignments.workerPayPreview(workerUserId), "max");
  }

  return result;
}