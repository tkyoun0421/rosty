import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const getAdminSupabaseClient = vi.fn(() => ({ from }));

vi.mock("#shared/lib/supabase/adminClient", () => ({
  getAdminSupabaseClient,
}));

describe("getAdminScheduleAttendanceDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITEST = "true";
  });

  it("returns one worker row for each confirmed assignment even when no attendance row exists", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "schedule-1",
        starts_at: "2026-04-10T10:00:00+09:00",
        ends_at: "2026-04-10T18:00:00+09:00",
        schedule_assignments: [
          {
            id: "assignment-1",
            worker_user_id: "worker-1",
            schedule_role_slot_id: "slot-1",
            status: "confirmed",
            profiles: { full_name: "Kim Hana" },
            schedule_role_slots: { id: "slot-1", role_code: "captain" },
            attendance_check_ins: [
              {
                checked_in_at: "2026-04-10T00:40:00.000Z",
                is_late: false,
              },
            ],
          },
          {
            id: "assignment-2",
            worker_user_id: "worker-2",
            schedule_role_slot_id: "slot-2",
            status: "confirmed",
            profiles: { full_name: "Lee Min" },
            schedule_role_slots: { id: "slot-2", role_code: "service" },
            attendance_check_ins: [],
          },
        ],
      },
      error: null,
    });

    const { getAdminScheduleAttendanceDetail } = await import(
      "#queries/attendance/dal/getAdminScheduleAttendanceDetail"
    );
    const result = await getAdminScheduleAttendanceDetail("schedule-1", {
      now: new Date("2026-04-10T01:20:00.000Z"),
    });

    expect(from).toHaveBeenCalledWith("schedules");
    expect(eq).toHaveBeenCalledWith("id", "schedule-1");
    expect(result?.workers).toEqual([
      expect.objectContaining({
        scheduleAssignmentId: "assignment-1",
        workerUserId: "worker-1",
        workerName: "Kim Hana",
        roleCode: "captain",
        status: "checked_in",
        checkedInAt: "2026-04-10T00:40:00.000Z",
      }),
      expect.objectContaining({
        scheduleAssignmentId: "assignment-2",
        workerUserId: "worker-2",
        workerName: "Lee Min",
        roleCode: "service",
        status: "not_checked_in",
        checkedInAt: null,
      }),
    ]);
  });

  it("maps checked in, late, not checked in, and not open yet states to stable labels", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "schedule-2",
        starts_at: "2026-04-10T11:00:00+09:00",
        ends_at: "2026-04-10T18:00:00+09:00",
        schedule_assignments: [
          {
            id: "assignment-1",
            worker_user_id: "worker-1",
            schedule_role_slot_id: "slot-1",
            status: "confirmed",
            profiles: { full_name: "On Time" },
            schedule_role_slots: { id: "slot-1", role_code: "captain" },
            attendance_check_ins: [
              {
                checked_in_at: "2026-04-10T01:00:00.000Z",
                is_late: false,
              },
            ],
          },
          {
            id: "assignment-2",
            worker_user_id: "worker-2",
            schedule_role_slot_id: "slot-2",
            status: "confirmed",
            profiles: { full_name: "Late Worker" },
            schedule_role_slots: { id: "slot-2", role_code: "service" },
            attendance_check_ins: [
              {
                checked_in_at: "2026-04-10T02:10:00.000Z",
                is_late: true,
              },
            ],
          },
          {
            id: "assignment-3",
            worker_user_id: "worker-3",
            schedule_role_slot_id: "slot-3",
            status: "confirmed",
            profiles: { full_name: "Missing Worker" },
            schedule_role_slots: { id: "slot-3", role_code: "setup" },
            attendance_check_ins: [],
          },
          {
            id: "assignment-4",
            worker_user_id: "worker-4",
            schedule_role_slot_id: "slot-4",
            status: "confirmed",
            profiles: { full_name: "Too Early" },
            schedule_role_slots: { id: "slot-4", role_code: "guide" },
            attendance_check_ins: [],
          },
        ],
      },
      error: null,
    });

    const { getAdminScheduleAttendanceDetail } = await import(
      "#queries/attendance/dal/getAdminScheduleAttendanceDetail"
    );
    const afterOpen = await getAdminScheduleAttendanceDetail("schedule-2", {
      now: new Date("2026-04-10T01:30:00.000Z"),
    });
    const beforeOpen = await getAdminScheduleAttendanceDetail("schedule-2", {
      now: new Date("2026-04-10T00:00:00.000Z"),
    });

    expect(afterOpen?.workers.map((worker) => worker.status)).toEqual([
      "checked_in",
      "late",
      "not_checked_in",
      "not_checked_in",
    ]);
    expect(beforeOpen?.workers[3]).toMatchObject({
      workerUserId: "worker-4",
      status: "not_open_yet",
    });
  });

  it("uses schedules.starts_at as both the attendance window source and lateness cutoff for this phase", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "schedule-3",
        starts_at: "2026-04-10T10:00:00+09:00",
        ends_at: "2026-04-10T18:00:00+09:00",
        schedule_assignments: [
          {
            id: "assignment-1",
            worker_user_id: "worker-1",
            schedule_role_slot_id: "slot-1",
            status: "confirmed",
            profiles: { full_name: "Boundary Worker" },
            schedule_role_slots: { id: "slot-1", role_code: "captain" },
            attendance_check_ins: [
              {
                checked_in_at: "2026-04-10T01:00:00.000Z",
                is_late: false,
              },
            ],
          },
          {
            id: "assignment-2",
            worker_user_id: "worker-2",
            schedule_role_slot_id: "slot-2",
            status: "confirmed",
            profiles: { full_name: "Late Boundary" },
            schedule_role_slots: { id: "slot-2", role_code: "service" },
            attendance_check_ins: [
              {
                checked_in_at: "2026-04-10T01:00:01.000Z",
                is_late: true,
              },
            ],
          },
          {
            id: "assignment-3",
            worker_user_id: "worker-3",
            schedule_role_slot_id: "slot-3",
            status: "confirmed",
            profiles: { full_name: "Window Worker" },
            schedule_role_slots: { id: "slot-3", role_code: "setup" },
            attendance_check_ins: [],
          },
        ],
      },
      error: null,
    });

    const { getAdminScheduleAttendanceDetail } = await import(
      "#queries/attendance/dal/getAdminScheduleAttendanceDetail"
    );
    const beforeTenAmOpen = await getAdminScheduleAttendanceDetail("schedule-3", {
      now: new Date("2026-04-09T23:19:59.000Z"),
    });
    const afterTenAmOpen = await getAdminScheduleAttendanceDetail("schedule-3", {
      now: new Date("2026-04-09T23:20:00.000Z"),
    });

    expect(beforeTenAmOpen?.schedule.opensAt).toBe("2026-04-09T23:20:00.000Z");
    expect(afterTenAmOpen?.workers[0]).toMatchObject({ status: "checked_in" });
    expect(afterTenAmOpen?.workers[1]).toMatchObject({ status: "late" });
    expect(beforeTenAmOpen?.workers[2]).toMatchObject({ status: "not_open_yet" });
    expect(afterTenAmOpen?.workers[2]).toMatchObject({ status: "not_checked_in" });
  });

  it("exposes schedule-level summary counts and render-ready worker metadata", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "schedule-4",
        starts_at: "2026-04-10T11:00:00+09:00",
        ends_at: "2026-04-10T18:00:00+09:00",
        schedule_assignments: [
          {
            id: "assignment-1",
            worker_user_id: "worker-1",
            schedule_role_slot_id: "slot-1",
            status: "confirmed",
            profiles: { full_name: "Kim Hana" },
            schedule_role_slots: { id: "slot-1", role_code: "captain" },
            attendance_check_ins: [
              {
                checked_in_at: "2026-04-10T01:05:00.000Z",
                is_late: false,
              },
            ],
          },
          {
            id: "assignment-2",
            worker_user_id: "worker-2",
            schedule_role_slot_id: "slot-2",
            status: "confirmed",
            profiles: { full_name: "Lee Min" },
            schedule_role_slots: { id: "slot-2", role_code: "service" },
            attendance_check_ins: [
              {
                checked_in_at: "2026-04-10T02:10:00.000Z",
                is_late: true,
              },
            ],
          },
          {
            id: "assignment-3",
            worker_user_id: "worker-3",
            schedule_role_slot_id: "slot-3",
            status: "confirmed",
            profiles: { full_name: null },
            schedule_role_slots: { id: "slot-3", role_code: "setup" },
            attendance_check_ins: [],
          },
        ],
      },
      error: null,
    });

    const { getAdminScheduleAttendanceDetail } = await import(
      "#queries/attendance/dal/getAdminScheduleAttendanceDetail"
    );
    const result = await getAdminScheduleAttendanceDetail("schedule-4", {
      now: new Date("2026-04-10T02:30:00.000Z"),
    });

    expect(result).toMatchObject({
      schedule: {
        id: "schedule-4",
        startsAt: "2026-04-10T11:00:00+09:00",
        endsAt: "2026-04-10T18:00:00+09:00",
        opensAt: "2026-04-10T00:10:00.000Z",
      },
      summary: {
        confirmedWorkerCount: 3,
        checkedInCount: 1,
        lateCount: 1,
        notCheckedInCount: 1,
        notOpenYetCount: 0,
      },
    });
    expect(result?.workers[2]).toEqual({
      scheduleAssignmentId: "assignment-3",
      workerUserId: "worker-3",
      workerName: null,
      roleSlotId: "slot-3",
      roleCode: "setup",
      status: "not_checked_in",
      checkedInAt: null,
      isLate: false,
    });
  });

  it("returns null for unknown schedules", async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { getAdminScheduleAttendanceDetail } = await import(
      "#queries/attendance/dal/getAdminScheduleAttendanceDetail"
    );

    await expect(getAdminScheduleAttendanceDetail("missing-schedule")).resolves.toBeNull();
  });

  it("filters out draft assignments from admin attendance review and summary counts", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "schedule-5",
        starts_at: "2026-04-10T11:00:00+09:00",
        ends_at: "2026-04-10T18:00:00+09:00",
        schedule_assignments: [
          {
            id: "assignment-1",
            worker_user_id: "worker-1",
            schedule_role_slot_id: "slot-1",
            status: "confirmed",
            profiles: { full_name: "Confirmed Worker" },
            schedule_role_slots: { id: "slot-1", role_code: "captain" },
            attendance_check_ins: [],
          },
          {
            id: "assignment-2",
            worker_user_id: "worker-2",
            schedule_role_slot_id: "slot-2",
            status: "draft",
            profiles: { full_name: "Draft Worker" },
            schedule_role_slots: { id: "slot-2", role_code: "service" },
            attendance_check_ins: [],
          },
        ],
      },
      error: null,
    });

    const { getAdminScheduleAttendanceDetail } = await import(
      "#queries/attendance/dal/getAdminScheduleAttendanceDetail"
    );
    const result = await getAdminScheduleAttendanceDetail("schedule-5", {
      now: new Date("2026-04-10T02:30:00.000Z"),
    });

    expect(result?.summary.confirmedWorkerCount).toBe(1);
    expect(result?.workers).toHaveLength(1);
    expect(result?.workers[0]).toMatchObject({
      scheduleAssignmentId: "assignment-1",
      workerUserId: "worker-1",
      workerName: "Confirmed Worker",
    });
    expect(result?.workers.find((worker) => worker.workerUserId === "worker-2")).toBeUndefined();
  });
});
