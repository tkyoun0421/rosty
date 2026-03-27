import { z } from "zod";

import type {
  EmployeeScheduleRequest,
  ScheduleRequestRole,
  ScheduleRequestStatus,
  ScheduleRequestTimeSlot,
} from "#queries/schedule-request/types/scheduleRequest";
import type {
  EmployeeScheduleRequestsResponse,
  ScheduleRequestRecord,
} from "#queries/schedule-request/dal/scheduleRequest";

const scheduleRequestTimeSlotValues = ["morning", "afternoon", "evening"] as const satisfies readonly ScheduleRequestTimeSlot[];
const scheduleRequestRoleValues = ["consulting", "service", "ceremony"] as const satisfies readonly ScheduleRequestRole[];
const scheduleRequestStatusValues = ["pending", "approved", "rejected"] as const satisfies readonly ScheduleRequestStatus[];

export const scheduleRequestRecordSchema = z.object({
  id: z.string().min(1),
  employeeId: z.string().min(1),
  workDate: z.string().min(1),
  timeSlot: z.enum(scheduleRequestTimeSlotValues),
  role: z.enum(scheduleRequestRoleValues),
  note: z.string(),
  status: z.enum(scheduleRequestStatusValues),
  submittedAt: z.string().datetime(),
  adminComment: z.string().nullable(),
});

export const employeeScheduleRequestsResponseSchema = z.object({
  requests: z.array(scheduleRequestRecordSchema),
});

export function parseEmployeeScheduleRequestsResponse(payload: unknown): EmployeeScheduleRequestsResponse {
  return employeeScheduleRequestsResponseSchema.parse(payload);
}

export function toEmployeeScheduleRequest(record: ScheduleRequestRecord): EmployeeScheduleRequest {
  return {
    ...record,
    submittedAt: new Date(record.submittedAt),
  };
}