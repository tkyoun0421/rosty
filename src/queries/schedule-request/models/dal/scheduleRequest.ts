import type { EmployeeScheduleRequestDto } from "#queries/schedule-request/models/dto/scheduleRequest";

export type EmployeeScheduleRequestDal = Omit<EmployeeScheduleRequestDto, "submittedAt"> & {
  submittedAt: Date;
};