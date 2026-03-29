import type {
  EmployeeScheduleRequest,
  ScheduleRequestHistoryEvent,
} from "#queries/schedule-request/types/scheduleRequest";

export type ScheduleRequestHistoryEventRecord = Omit<ScheduleRequestHistoryEvent, "createdAt"> & {
  createdAt: string;
};

export type ScheduleRequestRecord = Omit<
  EmployeeScheduleRequest,
  "workStartAt" | "workEndAt" | "submittedAt" | "assignedAt" | "history"
> & {
  workStartAt: string;
  workEndAt: string;
  submittedAt: string;
  assignedAt: string | null;
  history: ScheduleRequestHistoryEventRecord[];
};

export type EmployeeScheduleRequestsResponse = {
  requests: ScheduleRequestRecord[];
};
