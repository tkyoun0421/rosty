import { z } from "zod";

import type {
  ScheduleRequestRole,
  ScheduleRequestTimeSlot,
} from "#queries/schedule-request/models/dto/scheduleRequest";

const today = new Date();
today.setHours(0, 0, 0, 0);

export const SCHEDULE_TIME_SLOT_OPTIONS: Array<{ value: ScheduleRequestTimeSlot; label: string }> = [
  { value: "morning", label: "오전 (09:00 - 13:00)" },
  { value: "afternoon", label: "오후 (13:00 - 17:00)" },
  { value: "evening", label: "저녁 (17:00 - 21:00)" },
];

export const SCHEDULE_ROLE_OPTIONS: Array<{ value: ScheduleRequestRole; label: string }> = [
  { value: "consulting", label: "상담" },
  { value: "service", label: "음식 서빙" },
  { value: "ceremony", label: "행사 진행" },
];

export const scheduleRequestFormSchema = z.object({
  workDate: z
    .string()
    .min(1, "근무 날짜를 선택하세요.")
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
      message: "올바른 날짜 형식이 아닙니다.",
    })
    .refine((value) => new Date(`${value}T00:00:00`) >= today, {
      message: "오늘 이후 날짜만 신청할 수 있습니다.",
    }),
  timeSlot: z.enum(["morning", "afternoon", "evening"], {
    message: "시간대를 선택하세요.",
  }),
  role: z.enum(["consulting", "service", "ceremony"], {
    message: "근무 역할을 선택하세요.",
  }),
  note: z.string().trim().max(120, "메모는 120자 이하로 입력하세요."),
});

export type ScheduleRequestFormValues = z.infer<typeof scheduleRequestFormSchema>;

export const EMPTY_SCHEDULE_REQUEST_FORM: ScheduleRequestFormValues = {
  workDate: "",
  timeSlot: "morning",
  role: "consulting",
  note: "",
};