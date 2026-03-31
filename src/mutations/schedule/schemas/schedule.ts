import { z } from "zod";

export const scheduleRoleSlotSchema = z.object({
  roleCode: z.string(),
  headcount: z.number(),
});

export const scheduleSchema = z.object({
  startsAt: z.string(),
  endsAt: z.string(),
  roleSlots: z.array(scheduleRoleSlotSchema),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;
