import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";

export type ScheduleRequestRecord = Omit<EmployeeScheduleRequest, "submittedAt"> & {
  submittedAt: string;
};

export type EmployeeScheduleRequestsResponse = {
  requests: ScheduleRequestRecord[];
};
