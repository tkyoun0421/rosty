import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const eq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ select }));
const getAdminSupabaseClient = vi.fn(() => ({ from }));

vi.mock("#shared/lib/supabase/adminClient", () => ({
  getAdminSupabaseClient,
}));

describe("getAdminScheduleAssignmentDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITEST = "true";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  it("returns the schedule window, status, and role slots with assigned counts", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "schedule-1",
        starts_at: "2026-04-10T09:00:00+09:00",
        ends_at: "2026-04-10T13:00:00+09:00",
        status: "assigning",
        schedule_role_slots: [
          {
            id: "slot-1",
            role_code: "captain",
            headcount: 1,
            schedule_assignments: [{ worker_user_id: "worker-1", status: "draft" }],
          },
          {
            id: "slot-2",
            role_code: "server",
            headcount: 2,
            schedule_assignments: [
              { worker_user_id: "worker-2", status: "confirmed" },
              { worker_user_id: "worker-3", status: "draft" },
            ],
          },
        ],
        schedule_applications: [],
        schedule_assignments: [],
      },
      error: null,
    });

    const { getAdminScheduleAssignmentDetail } = await import(
      "#queries/assignment/dal/getAdminScheduleAssignmentDetail"
    );
    const result = await getAdminScheduleAssignmentDetail("schedule-1");

    expect(from).toHaveBeenCalledWith("schedules");
    expect(eq).toHaveBeenCalledWith("id", "schedule-1");
    expect(result?.schedule).toEqual({
      id: "schedule-1",
      startsAt: "2026-04-10T09:00:00+09:00",
      endsAt: "2026-04-10T13:00:00+09:00",
      status: "assigning",
    });
    expect(result?.roleSlots).toEqual([
      {
        id: "slot-1",
        roleCode: "captain",
        headcount: 1,
        assignedCount: 1,
      },
      {
        id: "slot-2",
        roleCode: "server",
        headcount: 2,
        assignedCount: 2,
      },
    ]);
  });

  it("derives applicant assignment labels from draft and confirmed rows", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "schedule-1",
        starts_at: "2026-04-10T09:00:00+09:00",
        ends_at: "2026-04-10T13:00:00+09:00",
        status: "assigning",
        schedule_role_slots: [],
        schedule_applications: [
          {
            worker_user_id: "worker-1",
            created_at: "2026-04-01T00:00:00.000Z",
            profiles: { full_name: "Kim Worker" },
          },
          {
            worker_user_id: "worker-2",
            created_at: "2026-04-01T01:00:00.000Z",
            profiles: { full_name: "Lee Worker" },
          },
          {
            worker_user_id: "worker-3",
            created_at: "2026-04-01T02:00:00.000Z",
            profiles: { full_name: "Park Worker" },
          },
        ],
        schedule_assignments: [
          {
            worker_user_id: "worker-1",
            schedule_role_slot_id: "slot-1",
            status: "draft",
            schedule_role_slots: { id: "slot-1", role_code: "captain" },
          },
          {
            worker_user_id: "worker-2",
            schedule_role_slot_id: "slot-2",
            status: "confirmed",
            schedule_role_slots: { id: "slot-2", role_code: "server" },
          },
        ],
      },
      error: null,
    });

    const { getAdminScheduleAssignmentDetail } = await import(
      "#queries/assignment/dal/getAdminScheduleAssignmentDetail"
    );
    const result = await getAdminScheduleAssignmentDetail("schedule-1");

    expect(result?.applicants).toEqual([
      {
        workerUserId: "worker-1",
        workerName: "Kim Worker",
        appliedAt: "2026-04-01T00:00:00.000Z",
        assignmentStatus: "draft_assigned",
        assignedRoleSlotId: "slot-1",
        assignedRoleCode: "captain",
      },
      {
        workerUserId: "worker-2",
        workerName: "Lee Worker",
        appliedAt: "2026-04-01T01:00:00.000Z",
        assignmentStatus: "confirmed_assigned",
        assignedRoleSlotId: "slot-2",
        assignedRoleCode: "server",
      },
      {
        workerUserId: "worker-3",
        workerName: "Park Worker",
        appliedAt: "2026-04-01T02:00:00.000Z",
        assignmentStatus: "unassigned",
        assignedRoleSlotId: null,
        assignedRoleCode: null,
      },
    ]);
  });

  it("surfaces the assigned role slot id and role code for assigned applicants", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "schedule-1",
        starts_at: "2026-04-10T09:00:00+09:00",
        ends_at: "2026-04-10T13:00:00+09:00",
        status: "assigning",
        schedule_role_slots: [],
        schedule_applications: [
          {
            worker_user_id: "worker-1",
            created_at: "2026-04-01T00:00:00.000Z",
            profiles: { full_name: null },
          },
        ],
        schedule_assignments: [
          {
            worker_user_id: "worker-1",
            schedule_role_slot_id: "slot-9",
            status: "confirmed",
            schedule_role_slots: { id: "slot-9", role_code: "guide" },
          },
        ],
      },
      error: null,
    });

    const { getAdminScheduleAssignmentDetail } = await import(
      "#queries/assignment/dal/getAdminScheduleAssignmentDetail"
    );
    const result = await getAdminScheduleAssignmentDetail("schedule-1");

    expect(result?.applicants[0]).toMatchObject({
      assignedRoleSlotId: "slot-9",
      assignedRoleCode: "guide",
      assignmentStatus: "confirmed_assigned",
    });
  });

  it("returns null for unknown schedule ids", async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { getAdminScheduleAssignmentDetail } = await import(
      "#queries/assignment/dal/getAdminScheduleAssignmentDetail"
    );

    await expect(getAdminScheduleAssignmentDetail("missing-schedule")).resolves.toBeNull();
  });
});
