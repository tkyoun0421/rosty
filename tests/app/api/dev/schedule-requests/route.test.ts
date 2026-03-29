import { afterEach, describe, expect, it, vi } from "vitest";

const BASE_REQUEST = {
  id: "request-001",
  employeeId: "employee-01",
  workId: "work-2026-04-12",
  workDate: "2026-04-12",
  workStartAt: "2026-04-12T02:00:00.000Z",
  workEndAt: "2026-04-12T09:00:00.000Z",
  note: "Need support",
  status: "rejected" as const,
  submittedAt: "2026-03-27T09:00:00.000Z",
  adminComment: "Already staffed",
  assignmentPosition: null,
  assignedLocation: null,
  assignedAt: null,
  assignedBy: null,
  history: [
    {
      type: "submitted" as const,
      createdAt: "2026-03-27T09:00:00.000Z",
      actorId: "employee-01",
      comment: "Need support",
      assignmentPosition: null,
      assignedLocation: null,
    },
    {
      type: "rejected" as const,
      createdAt: "2026-03-27T10:00:00.000Z",
      actorId: "admin-01",
      comment: "Already staffed",
      assignmentPosition: null,
      assignedLocation: null,
    },
  ],
};

describe("schedule-requests route", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("allows a new submission when the existing request for the same work is already processed", async () => {
    const prependScheduleRequestRecord = vi.fn();

    vi.doMock("#app/api/dev/lib/scheduleData", () => ({
      ADMIN_ID: "admin-01",
      EMPLOYEE_ID: "employee-01",
      getCurrentWorkRecord: () => ({
        id: "work-2026-04-12",
        workDate: "2026-04-12",
        startAt: "2026-04-12T02:00:00.000Z",
        endAt: "2026-04-12T09:00:00.000Z",
      }),
      listScheduleRequestRecords: () => [BASE_REQUEST],
      prependScheduleRequestRecord,
      replaceScheduleRequestRecord: vi.fn(),
    }));

    const { POST } = await import("#app/api/dev/schedule-requests/route");

    const response = await POST(
      new Request("http://localhost/api/dev/schedule-requests", {
        method: "POST",
        body: JSON.stringify({
          workId: "work-2026-04-12",
          note: "Retry after rejection",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(201);
    expect(prependScheduleRequestRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "pending",
        history: [
          expect.objectContaining({
            type: "submitted",
            actorId: "employee-01",
            comment: "Retry after rejection",
          }),
        ],
      }),
    );
  });

  it("appends an approval event when an admin approves a request", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-27T12:30:00.000Z"));

    const replaceScheduleRequestRecord = vi.fn();

    vi.doMock("#app/api/dev/lib/scheduleData", () => ({
      ADMIN_ID: "admin-01",
      EMPLOYEE_ID: "employee-01",
      getCurrentWorkRecord: vi.fn(),
      listScheduleRequestRecords: () => [
        {
          ...BASE_REQUEST,
          id: "request-002",
          status: "pending" as const,
          adminComment: null,
          history: [
            {
              type: "submitted" as const,
              createdAt: "2026-03-27T09:00:00.000Z",
              actorId: "employee-01",
              comment: "Need support",
              assignmentPosition: null,
              assignedLocation: null,
            },
          ],
        },
      ],
      prependScheduleRequestRecord: vi.fn(),
      replaceScheduleRequestRecord,
    }));

    const { PATCH } = await import("#app/api/dev/schedule-requests/route");

    const response = await PATCH(
      new Request("http://localhost/api/dev/schedule-requests", {
        method: "PATCH",
        body: JSON.stringify({
          requestId: "request-002",
          status: "approved",
          adminComment: "Assigned to guide",
          assignmentPosition: "guide",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(replaceScheduleRequestRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "approved",
        adminComment: "Assigned to guide",
        assignedBy: "admin-01",
        history: [
          expect.objectContaining({
            type: "submitted",
          }),
          expect.objectContaining({
            type: "approved",
            actorId: "admin-01",
            comment: "Assigned to guide",
            assignmentPosition: "guide",
          }),
        ],
      }),
    );
  });
});
