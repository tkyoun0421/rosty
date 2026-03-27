import { APP_ROUTES } from "#shared/constants/routes";
import type { ScheduleRequestInput } from "#mutations/schedule-request/schemas/scheduleRequest";

export async function submitScheduleRequest(values: ScheduleRequestInput): Promise<void> {
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
  throw new Error(payload?.message ?? "근무 요청 등록에 실패했습니다.");
}