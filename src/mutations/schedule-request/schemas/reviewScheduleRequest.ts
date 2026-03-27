import { z } from "zod";

export const REVIEW_SCHEDULE_REQUEST_STATUS_VALUES = ["approved", "rejected"] as const;

export const reviewScheduleRequestInputSchema = z.object({
  requestId: z.string().min(1, "처리할 요청을 선택해 주세요."),
  status: z.enum(REVIEW_SCHEDULE_REQUEST_STATUS_VALUES),
  adminComment: z.string().trim().max(120, "관리자 메모는 120자 이하로 입력해 주세요."),
});

export type ReviewScheduleRequestInput = z.infer<typeof reviewScheduleRequestInputSchema>;
