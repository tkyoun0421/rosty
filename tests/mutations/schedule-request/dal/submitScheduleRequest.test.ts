import { afterEach, describe, expect, it, vi } from "vitest";

import { submitScheduleRequest } from "#mutations/schedule-request/dal/submitScheduleRequest";
import { isAppError } from "#shared/lib/appError";

const INPUT = {
  workDate: "2026-04-12",
  timeSlot: "morning" as const,
  role: "service" as const,
  note: "Front desk support",
};

const CREATED_RECORD = {
  id: "request-004",
  employeeId: "employee-01",
  workDate: "2026-04-12",
  timeSlot: "morning" as const,
  role: "service" as const,
  note: "Front desk support",
  status: "pending" as const,
  submittedAt: "2026-03-28T10:00:00.000Z",
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

describe("submitScheduleRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the created schedule request when the request succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createJsonResponse({ request: CREATED_RECORD }, 201),
    );

    await expect(submitScheduleRequest(INPUT)).resolves.toEqual({
      ...CREATED_RECORD,
      submittedAt: new Date(CREATED_RECORD.submittedAt),
    });
  });

  it("throws an app error for a conflict response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createJsonResponse(
        {
          message: "같은 날짜와 시간대에는 한 번만 신청할 수 있습니다.",
        },
        409,
      ),
    );

    await expect(submitScheduleRequest(INPUT)).rejects.toSatisfy((error: unknown) => {
      expect(isAppError(error)).toBe(true);
      expect(error).toMatchObject({
        kind: "app-error",
        code: "CONFLICT",
        status: 409,
        message: "같은 날짜와 시간대에는 한 번만 신청할 수 있습니다.",
      });

      return true;
    });
  });
});
