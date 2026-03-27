import type { WorkInput } from "#mutations/work/schemas/work";
import { parseCurrentWorkResponse, toCurrentWork } from "#queries/work/schemas/work";
import type { CurrentWork } from "#queries/work/types/work";
import { APP_ROUTES } from "#shared/constants/routes";
import { createNetworkAppError, throwIfResponseError } from "#shared/lib/fetchError";

export async function submitWork(values: WorkInput): Promise<CurrentWork> {
  const response = await fetch(APP_ROUTES.devWork, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  }).catch((error: unknown) => {
    throw createNetworkAppError(error, "근무 저장에 실패했습니다.");
  });

  await throwIfResponseError(response, "근무 저장에 실패했습니다.");

  const payload = parseCurrentWorkResponse(await response.json());

  if (!payload.work) {
    throw new Error("근무 저장 응답에 work가 없습니다.");
  }

  return toCurrentWork(payload.work);
}
