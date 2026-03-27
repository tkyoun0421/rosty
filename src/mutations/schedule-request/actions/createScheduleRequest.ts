import { APP_ROUTES } from "#shared/constants/routes";
import type { ScheduleRequestFormValues } from "#mutations/schedule-request/models/form/ScheduleRequestForm";

export async function createScheduleRequest(values: ScheduleRequestFormValues): Promise<void> {
  const response = await fetch(APP_ROUTES.devScheduleRequests, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (response.ok) {
    return;
  }

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  throw new Error(payload?.message ?? "근무 신청 등록에 실패했습니다.");
}