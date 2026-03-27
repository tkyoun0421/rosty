import { submitScheduleRequest } from "#mutations/schedule-request/dal/submitScheduleRequest";
import type { ScheduleRequestInput } from "#mutations/schedule-request/schemas/scheduleRequest";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";

export async function createScheduleRequest(
  values: ScheduleRequestInput,
): Promise<EmployeeScheduleRequest> {
  return submitScheduleRequest(values);
}
