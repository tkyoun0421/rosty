import { z } from "zod";

export const confirmScheduleAssignmentsSchema = z.object({
  scheduleId: z.string().trim().min(1),
});

export type ConfirmScheduleAssignmentsInput = z.input<typeof confirmScheduleAssignmentsSchema>;
export type ConfirmScheduleAssignmentsPayload = z.output<typeof confirmScheduleAssignmentsSchema>;

export function normalizeConfirmScheduleAssignmentsInput(
  input: ConfirmScheduleAssignmentsInput | FormData,
): ConfirmScheduleAssignmentsInput {
  if (input instanceof FormData) {
    return {
      scheduleId: String(input.get("scheduleId") ?? ""),
    };
  }

  return input;
}

export function parseConfirmScheduleAssignments(
  input: ConfirmScheduleAssignmentsInput | FormData,
): ConfirmScheduleAssignmentsPayload {
  return confirmScheduleAssignmentsSchema.parse(normalizeConfirmScheduleAssignmentsInput(input));
}
