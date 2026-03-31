"use server";

import { confirmScheduleAssignments } from "#mutations/assignment/actions/confirmScheduleAssignments";

export async function submitScheduleAssignmentConfirm(formData: FormData): Promise<void> {
  await confirmScheduleAssignments(formData);
}
