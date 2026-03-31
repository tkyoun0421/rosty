"use server";

import { revalidateTag } from "next/cache";

import { replaceScheduleAssignmentDraft } from "#mutations/assignment/dal/assignmentDal";
import { parseSaveScheduleAssignmentDraft, type SaveScheduleAssignmentDraftInput } from "#mutations/assignment/schemas/saveScheduleAssignmentDraft";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import type { ScheduleAssignmentRecord } from "#shared/model/assignment";
import { cacheTags } from "#shared/config/cacheTags";

export async function saveScheduleAssignmentDraft(
  input: SaveScheduleAssignmentDraftInput | FormData,
): Promise<ScheduleAssignmentRecord[]> {
  await requireAdminUser();

  const parsed = parseSaveScheduleAssignmentDraft(input);
  const savedDraftRows = await replaceScheduleAssignmentDraft(parsed);

  revalidateTag(cacheTags.assignments.detail(parsed.scheduleId), "max");
  revalidateTag(cacheTags.schedules.adminList, "max");

  return savedDraftRows;
}
