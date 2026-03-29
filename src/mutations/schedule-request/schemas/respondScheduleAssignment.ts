import { z } from "zod";

export const RESPOND_SCHEDULE_ASSIGNMENT_STATUS_VALUES = ["accepted", "declined"] as const;

export const respondScheduleAssignmentInputSchema = z.object({
  requestId: z.string().min(1, "처리할 배정 요청을 선택해 주세요."),
  status: z.enum(RESPOND_SCHEDULE_ASSIGNMENT_STATUS_VALUES),
  employeeComment: z.string().trim().max(120, "응답 메모는 120자 이하로 입력해 주세요."),
});

export type RespondScheduleAssignmentInput = z.infer<typeof respondScheduleAssignmentInputSchema>;
