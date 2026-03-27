import { APP_ROUTES } from "#shared/constants/routes";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import {
  parseEmployeeScheduleRequestsResponse,
  toEmployeeScheduleRequest,
} from "#queries/schedule-request/schemas/scheduleRequest";

export async function fetchAdminScheduleRequests(): Promise<EmployeeScheduleRequest[]> {
  const response = await fetch(`${APP_ROUTES.devScheduleRequests}?scope=admin`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("신청 목록을 불러오지 못했습니다.");
  }

  const payload = parseEmployeeScheduleRequestsResponse(await response.json());

  return payload.requests.map(toEmployeeScheduleRequest);
}
