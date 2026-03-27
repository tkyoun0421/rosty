import {
  parseEmployeeScheduleRequestsResponse,
  toEmployeeScheduleRequest,
} from "#queries/schedule-request/schemas/scheduleRequest";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { APP_ROUTES } from "#shared/constants/routes";
import { createNetworkAppError, throwIfResponseError } from "#shared/lib/fetchError";

export async function fetchEmployeeScheduleRequests(): Promise<EmployeeScheduleRequest[]> {
  const response = await fetch(`${APP_ROUTES.devScheduleRequests}?scope=employee`, {
    method: "GET",
    cache: "no-store",
  }).catch((error: unknown) => {
    throw createNetworkAppError(error, "요청 현황을 불러오지 못했습니다.");
  });

  await throwIfResponseError(response, "요청 현황을 불러오지 못했습니다.");

  const payload = parseEmployeeScheduleRequestsResponse(await response.json());

  return payload.requests.map(toEmployeeScheduleRequest);
}
