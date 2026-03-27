import type { ReviewScheduleRequestInput } from "#mutations/schedule-request/schemas/reviewScheduleRequest";
import {
  parseScheduleRequestResponse,
  toEmployeeScheduleRequest,
} from "#queries/schedule-request/schemas/scheduleRequest";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { APP_ROUTES } from "#shared/constants/routes";
import { createNetworkAppError, throwIfResponseError } from "#shared/lib/fetchError";

export async function submitScheduleRequestReview(
  values: ReviewScheduleRequestInput,
): Promise<EmployeeScheduleRequest> {
  const response = await fetch(APP_ROUTES.devScheduleRequests, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  }).catch((error: unknown) => {
    throw createNetworkAppError(error, "요청 검토를 저장하지 못했습니다.");
  });

  await throwIfResponseError(response, "요청 검토를 저장하지 못했습니다.");

  const payload = parseScheduleRequestResponse(await response.json());

  return toEmployeeScheduleRequest(payload.request);
}
