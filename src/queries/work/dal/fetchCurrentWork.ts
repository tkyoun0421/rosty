import { parseCurrentWorkResponse, toCurrentWork } from "#queries/work/schemas/work";
import type { CurrentWork } from "#queries/work/types/work";
import { APP_ROUTES } from "#shared/constants/routes";
import { createNetworkAppError, throwIfResponseError } from "#shared/lib/fetchError";

export async function fetchCurrentWork(): Promise<CurrentWork | null> {
  const response = await fetch(APP_ROUTES.devWork, {
    method: "GET",
    cache: "no-store",
  }).catch((error: unknown) => {
    throw createNetworkAppError(error, "현재 근무 정보를 불러오지 못했습니다.");
  });

  await throwIfResponseError(response, "현재 근무 정보를 불러오지 못했습니다.");

  const payload = parseCurrentWorkResponse(await response.json());

  return payload.work ? toCurrentWork(payload.work) : null;
}
