import { beforeEach, describe, expect, it, vi } from "vitest";

const roleSlotsEq = vi.fn();
const applicationsEq = vi.fn();
const assignmentsEqStatus = vi.fn();
const assignmentsEqSchedule = vi.fn();
const insertSelect = vi.fn();
const insert = vi.fn(() => ({ select: insertSelect }));
const deleteIn = vi.fn();
const deleteEqStatus = vi.fn(() => ({ in: deleteIn }));
const deleteEqSchedule = vi.fn(() => ({ eq: deleteEqStatus }));
const updateEqId = vi.fn();
const update = vi.fn(() => ({ eq: updateEqId }));
const rpc = vi.fn();

const scheduleAssignmentsTable = {
  select: vi.fn(() => ({ eq: assignmentsEqSchedule })),
  insert,
  delete: vi.fn(() => ({ eq: deleteEqSchedule })),
  update,
};

const from = vi.fn((table: string) => {
  if (table === "schedule_role_slots") {
    return { select: vi.fn(() => ({ eq: roleSlotsEq })) };
  }

  if (table === "schedule_applications") {
    return { select: vi.fn(() => ({ eq: applicationsEq })) };
  }

  if (table === "schedule_assignments") {
    return scheduleAssignmentsTable;
  }

  throw new Error(`Unexpected table: ${table}`);
});

const getAdminSupabaseClientWithRpc = vi.fn(() => ({ from, rpc }));

vi.mock("#shared/lib/supabase/adminClient", () => ({
  getAdminSupabaseClient: getAdminSupabaseClientWithRpc,
}));

describe("replaceScheduleAssignmentDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    roleSlotsEq.mockResolvedValue({
      data: [
        { id: "slot-1", headcount: 1 },
        { id: "slot-2", headcount: 2 },
      ],
      error: null,
    });
    applicationsEq.mockResolvedValue({
      data: [{ worker_user_id: "worker-1" }, { worker_user_id: "worker-2" }],
      error: null,
    });
    assignmentsEqStatus.mockResolvedValue({
      data: [
        {
          id: "assignment-existing",
          schedule_id: "schedule-1",
          schedule_role_slot_id: "slot-1",
          worker_user_id: "worker-1",
          status: "draft",
          confirmed_at: null,
          confirmed_by: null,
          created_at: "2026-04-01T00:00:00.000Z",
          updated_at: "2026-04-01T00:00:00.000Z",
        },
      ],
      error: null,
    });
    assignmentsEqSchedule.mockReturnValue({ eq: assignmentsEqStatus });
    updateEqId.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: "assignment-existing",
            schedule_id: "schedule-1",
            schedule_role_slot_id: "slot-2",
            worker_user_id: "worker-1",
            status: "draft",
            confirmed_at: null,
            confirmed_by: null,
            created_at: "2026-04-01T00:00:00.000Z",
            updated_at: "2026-04-01T01:00:00.000Z",
          },
          error: null,
        }),
      }),
    });
    insertSelect.mockResolvedValue({
      data: [
        {
          id: "assignment-new",
          schedule_id: "schedule-1",
          schedule_role_slot_id: "slot-1",
          worker_user_id: "worker-2",
          status: "draft",
          confirmed_at: null,
          confirmed_by: null,
          created_at: "2026-04-01T01:00:00.000Z",
          updated_at: "2026-04-01T01:00:00.000Z",
        },
      ],
      error: null,
    });
    deleteIn.mockResolvedValue({
      error: null,
    });
    rpc.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  it("replaces the current draft set for a schedule and returns the saved draft rows", async () => {
    const { replaceScheduleAssignmentDraft } = await import("#mutations/assignment/dal/assignmentDal");
    const result = await replaceScheduleAssignmentDraft({
      scheduleId: "schedule-1",
      assignments: [
        {
          scheduleRoleSlotId: "slot-2",
          workerUserId: "worker-1",
        },
        {
          scheduleRoleSlotId: "slot-1",
          workerUserId: "worker-2",
        },
      ],
    });

    expect(roleSlotsEq).toHaveBeenCalledWith("schedule_id", "schedule-1");
    expect(applicationsEq).toHaveBeenCalledWith("schedule_id", "schedule-1");
    expect(assignmentsEqSchedule).toHaveBeenCalledWith("schedule_id", "schedule-1");
    expect(assignmentsEqStatus).toHaveBeenCalledWith("status", "draft");
    expect(update).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith([
      {
        schedule_id: "schedule-1",
        schedule_role_slot_id: "slot-1",
        worker_user_id: "worker-2",
        status: "draft",
      },
    ]);
    expect(result).toEqual([
      {
        id: "assignment-existing",
        scheduleId: "schedule-1",
        scheduleRoleSlotId: "slot-2",
        workerUserId: "worker-1",
        status: "draft",
        confirmedAt: null,
        confirmedBy: null,
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T01:00:00.000Z",
      },
      {
        id: "assignment-new",
        scheduleId: "schedule-1",
        scheduleRoleSlotId: "slot-1",
        workerUserId: "worker-2",
        status: "draft",
        confirmedAt: null,
        confirmedBy: null,
        createdAt: "2026-04-01T01:00:00.000Z",
        updatedAt: "2026-04-01T01:00:00.000Z",
      },
    ]);
  });

  it("rejects slot counts above the role-slot headcount", async () => {
    const { replaceScheduleAssignmentDraft } = await import("#mutations/assignment/dal/assignmentDal");

    await expect(
      replaceScheduleAssignmentDraft({
        scheduleId: "schedule-1",
        assignments: [
          { scheduleRoleSlotId: "slot-1", workerUserId: "worker-1" },
          { scheduleRoleSlotId: "slot-1", workerUserId: "worker-2" },
        ],
      }),
    ).rejects.toThrow("ROLE_SLOT_CAPACITY_EXCEEDED");
  });

  it("rejects workers that did not apply to the schedule", async () => {
    const { replaceScheduleAssignmentDraft } = await import("#mutations/assignment/dal/assignmentDal");

    await expect(
      replaceScheduleAssignmentDraft({
        scheduleId: "schedule-1",
        assignments: [{ scheduleRoleSlotId: "slot-1", workerUserId: "worker-9" }],
      }),
    ).rejects.toThrow("WORKER_NOT_APPLICANT");
  });

  it("confirms draft rows, stamps confirmation metadata, and updates the schedule status together", async () => {
    rpc.mockResolvedValue({
      data: [
        {
          id: "assignment-existing",
          schedule_id: "schedule-1",
          schedule_role_slot_id: "slot-1",
          worker_user_id: "worker-1",
          status: "confirmed",
          confirmed_at: "2026-04-02T00:00:00.000Z",
          confirmed_by: "admin-1",
          created_at: "2026-04-01T00:00:00.000Z",
          updated_at: "2026-04-02T00:00:00.000Z",
        },
      ],
      error: null,
    });

    const { confirmScheduleAssignmentDraft } = await import("#mutations/assignment/dal/assignmentDal");
    const result = await confirmScheduleAssignmentDraft({
      scheduleId: "schedule-1",
      confirmedBy: "admin-1",
    });

    expect(rpc).toHaveBeenCalledWith("confirm_schedule_assignments", {
      p_schedule_id: "schedule-1",
      p_confirmed_by: "admin-1",
    });
    expect(result.confirmedAssignments).toEqual([
      {
        id: "assignment-existing",
        scheduleId: "schedule-1",
        scheduleRoleSlotId: "slot-1",
        workerUserId: "worker-1",
        status: "confirmed",
        confirmedAt: "2026-04-02T00:00:00.000Z",
        confirmedBy: "admin-1",
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-02T00:00:00.000Z",
      },
    ]);
    expect(result.unfilledSlotIds).toEqual(["slot-2"]);
  });

  it("throws a stable error when there are no draft rows to confirm", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: {
        message: "NO_DRAFT_ASSIGNMENTS",
      },
    });

    const { confirmScheduleAssignmentDraft } = await import("#mutations/assignment/dal/assignmentDal");

    await expect(
      confirmScheduleAssignmentDraft({
        scheduleId: "schedule-1",
        confirmedBy: "admin-1",
      }),
    ).rejects.toThrow("NO_DRAFT_ASSIGNMENTS");
  });
});
