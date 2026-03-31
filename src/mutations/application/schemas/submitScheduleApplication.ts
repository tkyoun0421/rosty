import { z } from "zod";

export const submitScheduleApplicationSchema = z.object({
  scheduleId: z.string().trim().min(1),
});

export function parseSubmitScheduleApplicationFormData(formData: FormData) {
  return submitScheduleApplicationSchema.parse({
    scheduleId: String(formData.get("scheduleId") ?? ""),
  });
}