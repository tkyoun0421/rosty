import { submitScheduleRequest } from "#mutations/schedule-request/dal/submitScheduleRequest";
import type { ScheduleRequestInput } from "#mutations/schedule-request/schemas/scheduleRequest";

export async function createScheduleRequest(values: ScheduleRequestInput): Promise<void> {
  return submitScheduleRequest(values);
}
