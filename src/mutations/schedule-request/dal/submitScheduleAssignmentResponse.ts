import type { RespondScheduleAssignmentInput } from "#mutations/schedule-request/schemas/respondScheduleAssignment";
import {
  parseScheduleRequestResponse,
  toEmployeeScheduleRequest,
} from "#queries/schedule-request/schemas/scheduleRequest";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { APP_ROUTES } from "#shared/constants/routes";
import { createNetworkAppError, throwIfResponseError } from "#shared/lib/fetchError";

export async function submitScheduleAssignmentResponse(
  values: RespondScheduleAssignmentInput,
): Promise<EmployeeScheduleRequest> {
  const response = await fetch(APP_ROUTES.devScheduleRequests, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  }).catch((error: unknown) => {
    throw createNetworkAppError(error, "배정 응답을 전송하지 못했습니다.");
  });

  await throwIfResponseError(response, "배정 응답을 전송하지 못했습니다.");

  const payload = parseScheduleRequestResponse(await response.json());

  return toEmployeeScheduleRequest(payload.request);
}
