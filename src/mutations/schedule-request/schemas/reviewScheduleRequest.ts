import { z } from "zod";

import type { ScheduleAssignmentPosition } from "#queries/schedule-request/types/scheduleRequest";

export const REVIEW_SCHEDULE_REQUEST_STATUS_VALUES = ["approved", "rejected"] as const;
const scheduleAssignmentPositionValues = [
  "teamLead",
  "scan",
  "main",
  "dress",
  "waitingRoom",
  "congratulatorySong",
  "manager",
  "guide",
  "dressRoom",
] as const satisfies readonly ScheduleAssignmentPosition[];

export const reviewScheduleRequestInputSchema = z
  .object({
    requestId: z.string().min(1, "처리할 요청을 선택해 주세요."),
    status: z.enum(REVIEW_SCHEDULE_REQUEST_STATUS_VALUES),
    adminComment: z.string().trim().max(120, "관리자 메모는 120자 이하로 입력해 주세요."),
    assignmentPosition: z.enum(scheduleAssignmentPositionValues).nullable(),
  })
  .superRefine((value, context) => {
    if (value.status === "approved" && !value.assignmentPosition) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "배정 포지션을 선택해 주세요.",
        path: ["assignmentPosition"],
      });
    }
  });

export type ReviewScheduleRequestInput = z.infer<typeof reviewScheduleRequestInputSchema>;
