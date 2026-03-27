import { afterEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { fetchEmployeeScheduleRequests } from "#queries/schedule-request/dal/fetchEmployeeScheduleRequests";
import { isAppError } from "#shared/lib/appError";

const REQUEST_RECORD = {
  id: "request-001",
  employeeId: "employee-01",
  workDate: "2026-04-12",
  timeSlot: "morning" as const,
  role: "service" as const,
  note: "Support opening",
  status: "pending" as const,
  submittedAt: "2026-03-27T09:00:00.000Z",
  adminComment: null,
};

function createJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("fetchEmployeeScheduleRequests", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws an app error when the API responds with a non-ok status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createJsonResponse({ message: "요청 현황을 불러오지 못했습니다." }, 500),
    );

    await expect(fetchEmployeeScheduleRequests()).rejects.toSatisfy((error: unknown) => {
      expect(isAppError(error)).toBe(true);
      expect(error).toMatchObject({
        kind: "app-error",
        code: "UNKNOWN",
        status: 500,
        message: "요청 현황을 불러오지 못했습니다.",
      });

      return true;
    });
  });

  it("surfaces schema parse failures as non app errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createJsonResponse({
        requests: [
          {
            ...REQUEST_RECORD,
            submittedAt: null,
          },
        ],
      }),
    );

    await expect(fetchEmployeeScheduleRequests()).rejects.toBeInstanceOf(ZodError);
  });
});
