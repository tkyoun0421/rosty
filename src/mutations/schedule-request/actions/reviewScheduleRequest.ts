import { submitScheduleRequestReview } from "#mutations/schedule-request/dal/submitScheduleRequestReview";
import type { ReviewScheduleRequestInput } from "#mutations/schedule-request/schemas/reviewScheduleRequest";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";

export async function reviewScheduleRequest(
  values: ReviewScheduleRequestInput,
): Promise<EmployeeScheduleRequest> {
  return submitScheduleRequestReview(values);
}
