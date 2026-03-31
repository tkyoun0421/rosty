import { z } from "zod";

export const scheduleStatusSchema = z.enum(["recruiting", "assigning", "confirmed"]);

export const updateScheduleStatusSchema = z.object({
  scheduleId: z.string().trim().min(1),
  status: scheduleStatusSchema,
});

export type UpdateScheduleStatusInput = z.input<typeof updateScheduleStatusSchema>;

export function normalizeUpdateScheduleStatusInput(
  input: UpdateScheduleStatusInput | FormData,
): UpdateScheduleStatusInput {
  if (input instanceof FormData) {
    return {
      scheduleId: String(input.get("scheduleId") ?? ""),
      status: String(input.get("status") ?? "") as UpdateScheduleStatusInput["status"],
    };
  }

  return input;
}