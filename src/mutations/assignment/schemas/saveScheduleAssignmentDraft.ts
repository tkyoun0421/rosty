import { z } from "zod";

const assignmentEntrySchema = z.object({
  scheduleRoleSlotId: z.string().trim().min(1),
  workerUserId: z.string().trim().min(1),
});

export const saveScheduleAssignmentDraftSchema = z
  .object({
    scheduleId: z.string().trim().min(1),
    assignments: z.array(assignmentEntrySchema),
  })
  .superRefine((value, ctx) => {
    const seenWorkerIds = new Set<string>();

    value.assignments.forEach((assignment, index) => {
      if (seenWorkerIds.has(assignment.workerUserId)) {
        ctx.addIssue({
          code: "custom",
          path: ["assignments", index, "workerUserId"],
          message: "Each worker can only be assigned once per schedule.",
        });
      }

      seenWorkerIds.add(assignment.workerUserId);
    });
  })
  .transform(({ scheduleId, assignments }) => ({
    scheduleId,
    assignments: assignments.map((assignment) => ({
      scheduleRoleSlotId: assignment.scheduleRoleSlotId,
      workerUserId: assignment.workerUserId,
    })),
  }));

export type SaveScheduleAssignmentDraftInput = z.input<typeof saveScheduleAssignmentDraftSchema>;
export type SaveScheduleAssignmentDraftPayload = z.output<typeof saveScheduleAssignmentDraftSchema>;

function parseAssignmentsValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

export function normalizeSaveScheduleAssignmentDraftInput(
  input: SaveScheduleAssignmentDraftInput | FormData,
): SaveScheduleAssignmentDraftInput {
  if (input instanceof FormData) {
    return {
      scheduleId: String(input.get("scheduleId") ?? ""),
      assignments: parseAssignmentsValue(input.get("assignments")) as SaveScheduleAssignmentDraftInput["assignments"],
    };
  }

  return input;
}

export function parseSaveScheduleAssignmentDraft(
  input: SaveScheduleAssignmentDraftInput | FormData,
): SaveScheduleAssignmentDraftPayload {
  return saveScheduleAssignmentDraftSchema.parse(normalizeSaveScheduleAssignmentDraftInput(input));
}
