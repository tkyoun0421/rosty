import { beforeEach, describe, expect, it, vi } from "vitest";

const order = vi.fn();
const lt = vi.fn(() => ({ order }));
const gte = vi.fn(() => ({ lt }));
const select = vi.fn(() => ({ gte }));
const from = vi.fn(() => ({ select }));
const getAdminSupabaseClient = vi.fn(() => ({ from }));
const unstable_cache = vi.fn((callback: () => unknown, _keys: string[], _options: unknown) => callback);
const getAdminScheduleAssignmentDetail = vi.fn();
const getAdminScheduleAttendanceDetail = vi.fn();

vi.mock("next/cache", () => ({
  unstable_cache,
}));

vi.mock("#shared/lib/supabase/adminClient", () => ({
  getAdminSupabaseClient,
}));

vi.mock("#queries/assignment/dal/getAdminScheduleAssignmentDetail", () => ({
  getAdminScheduleAssignmentDetail,
}));

vi.mock("#queries/attendance/dal/getAdminScheduleAttendanceDetail", () => ({
  getAdminScheduleAttendanceDetail,
}));

describe("listAdminOperationsDashboardSchedules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITEST = "true";
    order.mockResolvedValue({
      data: [
        {
          id: "schedule-today",
          starts_at: "2026-04-07T11:00:00+09:00",
          ends_at: "2026-04-07T15:00:00+09:00",
          status: "assigning",
          schedule_role_slots: [
            {
              id: "slot-1",
              role_code: "captain",
              headcount: 1,
            },
            {
              id: "slot-2",
              role_code: "service",
              headcount: 1,
            },
          ],
          schedule_applications: [
            {
              worker_user_id: "worker-1",
              created_at: "2026-04-01T09:00:00.000Z",
            },
            {
              worker_user_id: "worker-2",
              created_at: "2026-04-01T10:00:00.000Z",
            },
            {
              worker_user_id: "worker-3",
              created_at: "2026-04-01T11:00:00.000Z",
            },
          ],
          schedule_assignments: [
            {
              id: "assignment-1",
              worker_user_id: "worker-1",
              schedule_role_slot_id: "slot-1",
              status: "confirmed",
              attendance_check_ins: [
                {
                  checked_in_at: "2026-04-07T02:05:00.000Z",
                  is_late: false,
                },
              ],
            },
            {
              id: "assignment-2",
              worker_user_id: "worker-2",
              schedule_role_slot_id: "slot-2",
              status: "confirmed",
              attendance_check_ins: [],
            },
          ],
        },
        {
          id: "schedule-upcoming",
          starts_at: "2026-04-08T09:00:00+09:00",
          ends_at: "2026-04-08T13:00:00+09:00",
          status: "assigning",
          schedule_role_slots: [
            {
              id: "slot-3",
              role_code: "guide",
              headcount: 1,
            },
            {
              id: "slot-4",
              role_code: "support",
              headcount: 1,
            },
          ],
          schedule_applications: [
            {
              worker_user_id: "worker-4",
              created_at: "2026-04-01T12:00:00.000Z",
            },
          ],
          schedule_assignments: [
            {
              id: "assignment-3",
              worker_user_id: "worker-4",
              schedule_role_slot_id: "slot-3",
              status: "draft",
              attendance_check_ins: [],
            },
          ],
        },
      ],
      error: null,
    });
  });

  it("fetches schedules in one dashboard window query and maps one summary card per schedule", async () => {
    const { listAdminOperationsDashboardSchedules } = await import(
      "#queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules"
    );
    const result = await listAdminOperationsDashboardSchedules({
      now: new Date("2026-04-07T09:30:00+09:00"),
    });

    expect(from).toHaveBeenCalledWith("schedules");
    expect(gte).toHaveBeenCalledWith("starts_at", "2026-04-06T15:00:00.000Z");
    expect(lt).toHaveBeenCalledWith("starts_at", "2026-04-10T15:00:00.000Z");
    expect(result.today).toHaveLength(1);
    expect(result.upcoming).toHaveLength(1);
    expect(getAdminScheduleAssignmentDetail).not.toHaveBeenCalled();
    expect(getAdminScheduleAttendanceDetail).not.toHaveBeenCalled();
  });

  it("includes application, staffing, attendance, and render-ready schedule labels on each card", async () => {
    const { listAdminOperationsDashboardSchedules } = await import(
      "#queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules"
    );
    const result = await listAdminOperationsDashboardSchedules({
      now: new Date("2026-04-07T09:30:00+09:00"),
    });

    expect(result.today[0]).toMatchObject({
      scheduleId: "schedule-today",
      title: "Schedule schedule-today",
      dateLabel: "Tue, Apr 7",
      startTimeLabel: "11:00 AM",
      applicantCount: 3,
      confirmedAssignmentCount: 2,
      checkedInCount: 1,
      lateCount: 0,
      topAnomaly: {
        kind: "missing_check_ins",
      },
    });
  });

  it("counts only confirmed assignments toward staffed coverage so draft rows keep an unfilled anomaly", async () => {
    const { listAdminOperationsDashboardSchedules } = await import(
      "#queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules"
    );
    const result = await listAdminOperationsDashboardSchedules({
      now: new Date("2026-04-07T09:30:00+09:00"),
    });

    expect(result.upcoming[0]).toMatchObject({
      scheduleId: "schedule-upcoming",
      confirmedAssignmentCount: 0,
      unfilledSlotCount: 2,
      topAnomaly: {
        kind: "unfilled_slots",
        count: 2,
      },
    });
  });

  it("uses dedicated dashboard cache tags for the admin operations read model", async () => {
    vi.resetModules();
    process.env.VITEST = "";

    const { cacheTags } = await import("#shared/config/cacheTags");
    const { listAdminOperationsDashboardSchedules } = await import(
      "#queries/operations-dashboard/dal/listAdminOperationsDashboardSchedules"
    );
    await listAdminOperationsDashboardSchedules();

    expect(cacheTags.dashboard).toEqual({
      all: "dashboard",
      adminOperations: "dashboard:admin-operations",
    });
    expect(unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Array),
      expect.objectContaining({
        tags: [cacheTags.dashboard.all, cacheTags.dashboard.adminOperations],
      }),
    );
  });
});
