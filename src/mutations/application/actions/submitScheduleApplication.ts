"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createScheduleApplication } from "#mutations/application/actions/createScheduleApplication";

const submitScheduleApplicationSchema = z.object({
  scheduleId: z.string().trim().min(1),
});

export async function submitScheduleApplication(formData: FormData) {
  const result = await createScheduleApplication(
    submitScheduleApplicationSchema.parse({
      scheduleId: String(formData.get("scheduleId") ?? ""),
    }),
  );

  revalidatePath("/worker/schedules");

  return result;
}
