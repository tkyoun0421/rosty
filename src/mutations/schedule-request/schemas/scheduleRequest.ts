import { z } from "zod";

import type {
  ScheduleRequestRole,
  ScheduleRequestTimeSlot,
} from "#queries/schedule-request/types/scheduleRequest";

const today = new Date();
today.setHours(0, 0, 0, 0);

export const SCHEDULE_TIME_SLOT_OPTIONS: Array<{ value: ScheduleRequestTimeSlot; label: string }> = [
  { value: "morning", label: "오전 (09:00 - 13:00)" },
  { value: "afternoon", label: "오후 (13:00 - 17:00)" },
  { value: "evening", label: "저녁 (17:00 - 21:00)" },
];

export const SCHEDULE_ROLE_OPTIONS: Array<{ value: ScheduleRequestRole; label: string }> = [
  { value: "consulting", label: "상담" },
  { value: "service", label: "뷔페 서빙" },
  { value: "ceremony", label: "예식 진행" },
];

export const scheduleRequestInputSchema = z.object({
  workDate: z
    .string()
    .min(1, "근무 날짜를 선택해 주세요")
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
      message: "올바른 날짜 형식이 아닙니다.",
    })
    .refine((value) => new Date(`${value}T00:00:00`) >= today, {
      message: "오늘 이후 날짜만 요청할 수 있습니다.",
    }),
  timeSlot: z.enum(["morning", "afternoon", "evening"], {
    message: "시간대를 선택해 주세요",
  }),
  role: z.enum(["consulting", "service", "ceremony"], {
    message: "근무 역할을 선택해 주세요",
  }),
  note: z.string().trim().max(120, "메모는 120자 이하로 입력해 주세요"),
});

export type ScheduleRequestInput = z.infer<typeof scheduleRequestInputSchema>;

export const EMPTY_SCHEDULE_REQUEST_INPUT: ScheduleRequestInput = {
  workDate: "",
  timeSlot: "morning",
  role: "consulting",
  note: "",
};