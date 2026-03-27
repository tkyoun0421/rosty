import { z } from "zod";

import type { ReviewScheduleRequestInput } from "#mutations/schedule-request/schemas/reviewScheduleRequest";
import {
  scheduleRequestRecordSchema,
  toEmployeeScheduleRequest,
} from "#queries/schedule-request/schemas/scheduleRequest";
import type { EmployeeScheduleRequest } from "#queries/schedule-request/types/scheduleRequest";
import { APP_ROUTES } from "#shared/constants/routes";

const reviewScheduleRequestResponseSchema = z.object({
  request: scheduleRequestRecordSchema,
});

export async function submitScheduleRequestReview(
  values: ReviewScheduleRequestInput,
): Promise<EmployeeScheduleRequest> {
  const response = await fetch(APP_ROUTES.devScheduleRequests, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? "요청 검토를 저장하지 못했습니다.");
  }

  const payload = reviewScheduleRequestResponseSchema.parse(await response.json());

  return toEmployeeScheduleRequest(payload.request);
}
