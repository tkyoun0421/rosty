"use server";

import { saveScheduleAssignmentDraft } from "#mutations/assignment/actions/saveScheduleAssignmentDraft";

export async function submitScheduleAssignmentDraft(formData: FormData): Promise<void> {
  await saveScheduleAssignmentDraft(formData);
}
