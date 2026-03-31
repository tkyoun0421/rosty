import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toScheduleDateTime(date: string, time: string) {
  return `${date}T${time}:00+09:00`;
}

const scheduleRoleSlotSchema = z.object({
  roleCode: z.string().trim().min(1),
  headcount: z.coerce.number().int().positive(),
});

const scheduleFormSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(timePattern),
    endTime: z.string().regex(timePattern),
    roleSlots: z.array(scheduleRoleSlotSchema).min(1),
  })
  .superRefine((value, ctx) => {
    if (value.endTime <= value.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time.",
      });
    }
  });

export const scheduleSchema = scheduleFormSchema.transform(({ date, startTime, endTime, roleSlots }) => ({
  startsAt: toScheduleDateTime(date, startTime),
  endsAt: toScheduleDateTime(date, endTime),
  roleSlots: roleSlots.map((slot) => ({
    roleCode: slot.roleCode.trim(),
    headcount: slot.headcount,
  })),
}));

export type ScheduleFormInput = z.input<typeof scheduleSchema>;
export type ScheduleInput = z.output<typeof scheduleSchema>;
