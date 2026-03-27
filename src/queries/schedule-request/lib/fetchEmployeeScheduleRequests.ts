import { APP_ROUTES } from "#shared/constants/routes";
import type { EmployeeScheduleRequestDal } from "#queries/schedule-request/models/dal/scheduleRequest";
import type { EmployeeScheduleRequestDto } from "#queries/schedule-request/models/dto/scheduleRequest";

export async function fetchEmployeeScheduleRequests(): Promise<EmployeeScheduleRequestDal[]> {
  const response = await fetch(APP_ROUTES.devScheduleRequests, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("신청 현황을 불러오지 못했습니다.");
  }

  const payload = (await response.json()) as { requests: EmployeeScheduleRequestDto[] };

  return payload.requests.map((request) => ({
    ...request,
    submittedAt: new Date(request.submittedAt),
  }));
}