import { describe, expect, it } from "vitest";

import {
  parseEmployeeScheduleRequestsResponse,
  toEmployeeScheduleRequest,
} from "#queries/schedule-request/schemas/scheduleRequest";

const REQUEST_RECORD = {
  id: "request-001",
  employeeId: "employee-01",
  workId: "work-2026-04-12",
  workDate: "2026-04-12",
  workStartAt: "2026-04-12T02:00:00.000Z",
  workEndAt: "2026-04-12T09:00:00.000Z",
  note: "Support opening",
  status: "approved" as const,
  submittedAt: "2026-03-27T09:00:00.000Z",
  adminComment: "Assigned to lobby",
  assignmentPosition: "guide" as const,
  assignedLocation: "Lobby desk",
  assignedAt: "2026-03-27T12:30:00.000Z",
  assignedBy: "admin-01",
  history: [
    {
      type: "submitted" as const,
      createdAt: "2026-03-27T09:00:00.000Z",
      actorId: "employee-01",
      comment: "Support opening",
      assignmentPosition: null,
      assignedLocation: null,
    },
    {
      type: "approved" as const,
      createdAt: "2026-03-27T12:30:00.000Z",
      actorId: "admin-01",
      comment: "Assigned to lobby",
      assignmentPosition: "guide" as const,
      assignedLocation: "Lobby desk",
    },
  ],
};

describe("scheduleRequest schemas", () => {
  it("parses history records from the API payload", () => {
    const payload = parseEmployeeScheduleRequestsResponse({
      requests: [REQUEST_RECORD],
    });

    expect(payload.requests[0]).toMatchObject({
      id: "request-001",
      history: [
        expect.objectContaining({
          type: "submitted",
          actorId: "employee-01",
        }),
        expect.objectContaining({
          type: "approved",
          assignmentPosition: "guide",
          assignedLocation: "Lobby desk",
        }),
      ],
    });
  });

  it("converts history timestamps into dates", () => {
    const request = toEmployeeScheduleRequest(REQUEST_RECORD);

    expect(request.history).toHaveLength(2);
    expect(request.history[0]).toMatchObject({
      type: "submitted",
      actorId: "employee-01",
    });
    expect(request.history[0].createdAt).toBeInstanceOf(Date);
    expect(request.history[1].createdAt).toBeInstanceOf(Date);
  });
});
