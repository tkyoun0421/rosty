import type { ScheduleRequestInput } from "#mutations/schedule-request/schemas/scheduleRequest";
import {
  parseScheduleRequestResponse,
  toEmployeeScheduleRequest,
} from "#queries/schedule-request/schemas/scheduleRequest";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { APP_ROUTES } from "#shared/constants/routes";
import { createNetworkAppError, throwIfResponseError } from "#shared/lib/fetchError";

export async function submitScheduleRequest(
  values: ScheduleRequestInput,
): Promise<EmployeeScheduleRequest> {
  const response = await fetch(APP_ROUTES.devScheduleRequests, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  }).catch((error: unknown) => {
    throw createNetworkAppError(error, "근무 요청 등록에 실패했습니다.");
  });

  await throwIfResponseError(response, "근무 요청 등록에 실패했습니다.");

  const payload = parseScheduleRequestResponse(await response.json());

  return toEmployeeScheduleRequest(payload.request);
}
