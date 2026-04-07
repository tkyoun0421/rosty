import { beforeEach, describe, expect, it, vi } from "vitest";

const listConfirmedWorkerAssignments = vi.fn();
const getServerSupabaseClient = vi.fn();

vi.mock("#queries/assignment/dal/listConfirmedWorkerAssignments", () => ({
  listConfirmedWorkerAssignments,
}));

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

function createAssignment(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    assignmentId: "assignment-1",
    scheduleId: "schedule-1",
    scheduleRoleSlotId: "slot-1",
    roleCode: "captain",
    startsAt: "2026-04-10T10:00:00+09:00",
    endsAt: "2026-04-10T18:00:00+09:00",
    payStatus: "ready",
    hourlyRateCents: 12000,
    regularHours: 8,
    overtimeHours: 0,
    overtimeApplied: false,
    regularPayCents: 96000,
    overtimePayCents: 0,
    totalPayCents: 96000,
    ...overrides,
  };
}

describe("listWorkerAttendanceStatuses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts from confirmed assignments and returns one status per assignment even without attendance rows", async () => {
    listConfirmedWorkerAssignments.mockResolvedValue([
      createAssignment(),
      createAssignment({
        assignmentId: "assignment-2",
        scheduleId: "schedule-2",
        scheduleRoleSlotId: "slot-2",
        roleCode: "guide",
        startsAt: "2026-04-10T11:00:00+09:00",
        endsAt: "2026-04-10T19:00:00+09:00",
      }),
    ]);

    const inFilter = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const eq = vi.fn(() => ({ in: inFilter }));
    const select = vi.fn(() => ({ eq }));

    getServerSupabaseClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    const { listWorkerAttendanceStatuses } = await import(
      "#queries/attendance/dal/listWorkerAttendanceStatuses"
    );
    const result = await listWorkerAttendanceStatuses("worker-1", new Date("2026-04-10T08:00:00+09:00"));

    expect(listConfirmedWorkerAssignments).toHaveBeenCalledWith("worker-1");
    expect(result).toEqual([
      {
        assignmentId: "assignment-1",
        scheduleId: "schedule-1",
        checkInOpensAt: "2026-04-09T23:20:00.000Z",
        windowStatus: "not_open_yet",
        submissionStatus: "not_submitted",
        checkedInAt: null,
        isLate: null,
      },
      {
        assignmentId: "assignment-2",
        scheduleId: "schedule-2",
        checkInOpensAt: "2026-04-10T00:10:00.000Z",
        windowStatus: "not_open_yet",
        submissionStatus: "not_submitted",
        checkedInAt: null,
        isLate: null,
      },
    ]);
  });

  it("keeps attendance status generation available when pay data is missing", async () => {
    listConfirmedWorkerAssignments.mockResolvedValue([
      createAssignment({
        payStatus: "missing_worker_rate",
        hourlyRateCents: null,
        regularHours: null,
        overtimeHours: null,
        regularPayCents: null,
        overtimePayCents: null,
        totalPayCents: null,
      }),
    ]);

    const inFilter = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const eq = vi.fn(() => ({ in: inFilter }));
    const select = vi.fn(() => ({ eq }));

    getServerSupabaseClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    const { listWorkerAttendanceStatuses } = await import(
      "#queries/attendance/dal/listWorkerAttendanceStatuses"
    );
    const result = await listWorkerAttendanceStatuses("worker-1", new Date("2026-04-10T09:30:00+09:00"));

    expect(result).toEqual([
      expect.objectContaining({
        assignmentId: "assignment-1",
        scheduleId: "schedule-1",
        checkInOpensAt: "2026-04-09T23:20:00.000Z",
        windowStatus: "open",
        submissionStatus: "not_submitted",
      }),
    ]);
  });

  it("returns stable submitted state without requiring UI-side attendance math", async () => {
    listConfirmedWorkerAssignments.mockResolvedValue([createAssignment()]);

    const inFilter = vi.fn().mockResolvedValue({
      data: [
        {
          schedule_assignment_id: "assignment-1",
          schedule_id: "schedule-1",
          checked_in_at: "2026-04-10T01:30:00.000Z",
          is_late: false,
        },
      ],
      error: null,
    });
    const eq = vi.fn(() => ({ in: inFilter }));
    const select = vi.fn(() => ({ eq }));

    getServerSupabaseClient.mockResolvedValue({
      from: vi.fn(() => ({ select })),
    });

    const { listWorkerAttendanceStatuses } = await import(
      "#queries/attendance/dal/listWorkerAttendanceStatuses"
    );
    const result = await listWorkerAttendanceStatuses("worker-1", new Date("2026-04-10T11:30:00+09:00"));

    expect(result).toEqual([
      {
        assignmentId: "assignment-1",
        scheduleId: "schedule-1",
        checkInOpensAt: "2026-04-09T23:20:00.000Z",
        windowStatus: "submitted",
        submissionStatus: "submitted",
        checkedInAt: "2026-04-10T01:30:00.000Z",
        isLate: false,
      },
    ]);
  });
});
