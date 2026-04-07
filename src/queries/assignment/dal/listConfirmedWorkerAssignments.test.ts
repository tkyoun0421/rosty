import { beforeEach, describe, expect, it, vi } from "vitest";

const unstable_cache = vi.fn((callback: () => unknown, _keys: string[], _options: unknown) => callback);
const assignmentsEqStatus = vi.fn();
const assignmentsEqWorker = vi.fn(() => ({ eq: assignmentsEqStatus }));
const assignmentsSelect = vi.fn(() => ({ eq: assignmentsEqWorker }));

const workerRatesMaybeSingle = vi.fn();
const workerRatesEq = vi.fn(() => ({ maybeSingle: workerRatesMaybeSingle }));
const workerRatesSelect = vi.fn(() => ({ eq: workerRatesEq }));

const from = vi.fn((table: string) => {
  if (table === "schedule_assignments") {
    return { select: assignmentsSelect };
  }

  if (table === "worker_rates") {
    return { select: workerRatesSelect };
  }

  throw new Error(`Unexpected table ${table}`);
});

const getServerSupabaseClient = vi.fn(async () => ({ from }));

vi.mock("next/cache", () => ({
  unstable_cache,
}));

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

function createAssignmentRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "assignment-1",
    schedule_id: "schedule-1",
    schedule_role_slot_id: "slot-1",
    worker_user_id: "worker-1",
    status: "confirmed",
    schedules: {
      starts_at: "2026-04-10T09:00:00+09:00",
      ends_at: "2026-04-10T18:00:00+09:00",
      status: "confirmed",
    },
    schedule_role_slots: {
      id: "slot-1",
      role_code: "captain",
    },
    ...overrides,
  };
}

describe("listConfirmedWorkerAssignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITEST = "true";
    workerRatesMaybeSingle.mockResolvedValue({
      data: { hourly_rate_cents: 12000 },
      error: null,
    });
  });

  it("returns confirmed assignments with role, schedule window, and ready pay breakdown", async () => {
    assignmentsEqStatus.mockResolvedValue({
      data: [createAssignmentRow()],
      error: null,
    });

    const { listConfirmedWorkerAssignments } = await import(
      "#queries/assignment/dal/listConfirmedWorkerAssignments"
    );
    const result = await listConfirmedWorkerAssignments("worker-1");

    expect(assignmentsEqWorker).toHaveBeenCalledWith("worker_user_id", "worker-1");
    expect(assignmentsEqStatus).toHaveBeenCalledWith("status", "confirmed");
    expect(workerRatesEq).toHaveBeenCalledWith("user_id", "worker-1");
    expect(result).toEqual([
      {
        assignmentId: "assignment-1",
        scheduleId: "schedule-1",
        scheduleRoleSlotId: "slot-1",
        roleCode: "captain",
        startsAt: "2026-04-10T09:00:00+09:00",
        endsAt: "2026-04-10T18:00:00+09:00",
        payStatus: "ready",
        hourlyRateCents: 12000,
        regularHours: 9,
        overtimeHours: 0,
        overtimeApplied: false,
        regularPayCents: 108000,
        overtimePayCents: 0,
        totalPayCents: 108000,
      },
    ]);
  });

  it("filters out rows whose joined schedule is not confirmed", async () => {
    assignmentsEqStatus.mockResolvedValue({
      data: [
        createAssignmentRow({
          id: "assignment-confirmed",
          schedules: {
            starts_at: "2026-04-10T09:00:00+09:00",
            ends_at: "2026-04-10T20:00:00+09:00",
            status: "confirmed",
          },
        }),
        createAssignmentRow({
          id: "assignment-hidden",
          schedule_id: "schedule-2",
          schedule_role_slot_id: "slot-2",
          schedules: {
            starts_at: "2026-04-11T09:00:00+09:00",
            ends_at: "2026-04-11T13:00:00+09:00",
            status: "assigning",
          },
          schedule_role_slots: {
            id: "slot-2",
            role_code: "server",
          },
        }),
      ],
      error: null,
    });

    const { listConfirmedWorkerAssignments } = await import(
      "#queries/assignment/dal/listConfirmedWorkerAssignments"
    );
    const result = await listConfirmedWorkerAssignments("worker-1");

    expect(result).toHaveLength(1);
    expect(result[0]?.assignmentId).toBe("assignment-confirmed");
    expect(result[0]?.payStatus).toBe("ready");
    expect(result[0]?.overtimeApplied).toBe(true);
    expect(result[0]?.overtimeHours).toBe(2);
    expect(result[0]?.totalPayCents).toBe(144000);
  });

  it("preserves confirmed assignments when the worker rate is not visible", async () => {
    assignmentsEqStatus.mockResolvedValue({
      data: [createAssignmentRow()],
      error: null,
    });
    workerRatesMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { listConfirmedWorkerAssignments } = await import(
      "#queries/assignment/dal/listConfirmedWorkerAssignments"
    );

    await expect(listConfirmedWorkerAssignments("worker-1")).resolves.toEqual([
      {
        assignmentId: "assignment-1",
        scheduleId: "schedule-1",
        scheduleRoleSlotId: "slot-1",
        roleCode: "captain",
        startsAt: "2026-04-10T09:00:00+09:00",
        endsAt: "2026-04-10T18:00:00+09:00",
        payStatus: "missing_worker_rate",
        hourlyRateCents: null,
        regularHours: null,
        overtimeHours: null,
        overtimeApplied: false,
        regularPayCents: null,
        overtimePayCents: null,
        totalPayCents: null,
      },
    ]);
  });

  it("uses the dedicated worker pay-preview cache tag in the cached branch", async () => {
    vi.resetModules();
    process.env.VITEST = "";

    const { cacheTags } = await import("#shared/config/cacheTags");
    const { listConfirmedWorkerAssignments } = await import(
      "#queries/assignment/dal/listConfirmedWorkerAssignments"
    );
    await listConfirmedWorkerAssignments("worker-1");

    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Array),
      expect.objectContaining({
        tags: [
          cacheTags.assignments.all,
          cacheTags.assignments.workerConfirmed("worker-1"),
          cacheTags.assignments.workerPayPreview("worker-1"),
        ],
      }),
    );
  });
});
