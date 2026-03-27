import { z } from "zod";

export const scheduleRequestInputSchema = z.object({
  workId: z.string().min(1, "현재 신청 가능한 근무가 없습니다."),
  note: z.string().trim().max(120, "메모는 120자 이하로 입력해 주세요."),
});

export type ScheduleRequestInput = z.infer<typeof scheduleRequestInputSchema>;

export const EMPTY_SCHEDULE_REQUEST_INPUT: ScheduleRequestInput = {
  workId: "",
  note: "",
};
