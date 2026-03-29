import { submitScheduleAssignmentResponse } from "#mutations/schedule-request/dal/submitScheduleAssignmentResponse";
import type { RespondScheduleAssignmentInput } from "#mutations/schedule-request/schemas/respondScheduleAssignment";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";

export async function respondScheduleAssignment(
  values: RespondScheduleAssignmentInput,
): Promise<EmployeeScheduleRequest> {
  return submitScheduleAssignmentResponse(values);
}
