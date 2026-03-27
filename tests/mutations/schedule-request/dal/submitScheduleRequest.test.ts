import { afterEach, describe, expect, it, vi } from "vitest";

import { submitScheduleRequest } from "#mutations/schedule-request/dal/submitScheduleRequest";
import { isAppError } from "#shared/lib/appError";

const INPUT = {
  workId: "work-2026-04-12",
  note: "Front desk support",
};

const CREATED_RECORD = {
  id: "request-004",
  employeeId: "employee-01",
  workId: "work-2026-04-12",
  workDate: "2026-04-12",
  workStartAt: "2026-04-12T02:00:00.000Z",
  workEndAt: "2026-04-12T09:00:00.000Z",
  note: "Front desk support",
  status: "pending" as const,
  submittedAt: "2026-03-28T10:00:00.000Z",
  adminComment: null,
  assignmentPosition: null,
  assignedLocation: null,
  assignedAt: null,
  assignedBy: null,
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
      workStartAt: new Date(CREATED_RECORD.workStartAt),
      workEndAt: new Date(CREATED_RECORD.workEndAt),
      assignedAt: null,
      submittedAt: new Date(CREATED_RECORD.submittedAt),
    });
  });

  it("throws an app error for a conflict response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      createJsonResponse(
        {
          message: "같은 근무에는 한 번만 신청할 수 있습니다.",
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
        message: "같은 근무에는 한 번만 신청할 수 있습니다.",
      });

      return true;
    });
  });
});
