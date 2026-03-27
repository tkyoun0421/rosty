import { z } from "zod";

function isValidDateString(value: string) {
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function isValidTimeString(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

export const workInputSchema = z
  .object({
    workDate: z.string().min(1, "근무 날짜를 선택해 주세요.").refine(isValidDateString, {
      message: "올바른 날짜 형식이 아닙니다.",
    }),
    startTime: z.string().refine(isValidTimeString, {
      message: "시작 시간을 선택해 주세요.",
    }),
    endTime: z.string().refine(isValidTimeString, {
      message: "종료 시간을 선택해 주세요.",
    }),
  })
  .superRefine((value, context) => {
    if (toMinutes(value.startTime) >= toMinutes(value.endTime)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "종료 시간은 시작 시간보다 늦어야 합니다.",
        path: ["endTime"],
      });
    }
  });

export type WorkInput = z.infer<typeof workInputSchema>;

export const EMPTY_WORK_INPUT: WorkInput = {
  workDate: "",
  startTime: "10:00",
  endTime: "17:00",
};
