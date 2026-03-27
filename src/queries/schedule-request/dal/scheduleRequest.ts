import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";

export type ScheduleRequestRecord = Omit<
  EmployeeScheduleRequest,
  "workStartAt" | "workEndAt" | "submittedAt" | "assignedAt"
> & {
  workStartAt: string;
  workEndAt: string;
  submittedAt: string;
  assignedAt: string | null;
};

export type EmployeeScheduleRequestsResponse = {
  requests: ScheduleRequestRecord[];
};
