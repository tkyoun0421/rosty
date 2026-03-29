import { z } from "zod";

import type {
  EmployeeScheduleRequest,
  ScheduleAssignmentPosition,
  ScheduleRequestHistoryEventType,
  ScheduleRequestStatus,
} from "#queries/schedule-request/types/scheduleRequest";
import type {
  EmployeeScheduleRequestsResponse,
  ScheduleRequestRecord,
} from "#queries/schedule-request/dal/scheduleRequest";

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
const scheduleRequestStatusValues = [
  "pending",
  "approved",
  "rejected",
] as const satisfies readonly ScheduleRequestStatus[];
const scheduleRequestHistoryEventTypeValues = [
  "submitted",
  "approved",
  "rejected",
] as const satisfies readonly ScheduleRequestHistoryEventType[];

export const scheduleRequestHistoryEventRecordSchema = z.object({
  type: z.enum(scheduleRequestHistoryEventTypeValues),
  createdAt: z.string().datetime(),
  actorId: z.string().min(1),
  comment: z.string().nullable(),
  assignmentPosition: z.enum(scheduleAssignmentPositionValues).nullable(),
  assignedLocation: z.string().nullable(),
});

export const scheduleRequestRecordSchema = z.object({
  id: z.string().min(1),
  employeeId: z.string().min(1),
  workId: z.string().min(1),
  workDate: z.string().min(1),
  workStartAt: z.string().datetime(),
  workEndAt: z.string().datetime(),
  note: z.string(),
  status: z.enum(scheduleRequestStatusValues),
  submittedAt: z.string().datetime(),
  adminComment: z.string().nullable(),
  assignmentPosition: z.enum(scheduleAssignmentPositionValues).nullable(),
  assignedLocation: z.string().nullable(),
  assignedAt: z.string().datetime().nullable(),
  assignedBy: z.string().nullable(),
  history: z.array(scheduleRequestHistoryEventRecordSchema),
});

export const employeeScheduleRequestsResponseSchema = z.object({
  requests: z.array(scheduleRequestRecordSchema),
});

export const scheduleRequestResponseSchema = z.object({
  request: scheduleRequestRecordSchema,
});

export function parseEmployeeScheduleRequestsResponse(
  payload: unknown,
): EmployeeScheduleRequestsResponse {
  return employeeScheduleRequestsResponseSchema.parse(payload);
}

export function parseScheduleRequestResponse(payload: unknown): {
  request: ScheduleRequestRecord;
} {
  return scheduleRequestResponseSchema.parse(payload);
}

export function toEmployeeScheduleRequest(record: ScheduleRequestRecord): EmployeeScheduleRequest {
  return {
    ...record,
    workStartAt: new Date(record.workStartAt),
    workEndAt: new Date(record.workEndAt),
    submittedAt: new Date(record.submittedAt),
    assignmentPosition: record.assignmentPosition ?? null,
    assignedLocation: record.assignedLocation ?? null,
    assignedAt: record.assignedAt ? new Date(record.assignedAt) : null,
    assignedBy: record.assignedBy ?? null,
    history: record.history.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      comment: item.comment ?? null,
      assignmentPosition: item.assignmentPosition ?? null,
      assignedLocation: item.assignedLocation ?? null,
    })),
  };
}
