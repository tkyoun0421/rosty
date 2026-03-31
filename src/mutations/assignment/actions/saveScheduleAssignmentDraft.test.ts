import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
const requireAdminUser = vi.fn();
const replaceScheduleAssignmentDraft = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag,
}));

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

vi.mock("#mutations/assignment/dal/assignmentDal", () => ({
  replaceScheduleAssignmentDraft,
}));

describe("saveScheduleAssignmentDraft", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves a whole-schedule draft and revalidates assignment detail plus admin schedule list tags", async () => {
    requireAdminUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });
    replaceScheduleAssignmentDraft.mockResolvedValue([
      {
        id: "assignment-1",
        scheduleId: "schedule-1",
        scheduleRoleSlotId: "slot-1",
        workerUserId: "worker-1",
        status: "draft",
        confirmedAt: null,
        confirmedBy: null,
        createdAt: "2026-04-01T00:00:00.000Z",
        updatedAt: "2026-04-01T00:00:00.000Z",
      },
    ]);

    const { saveScheduleAssignmentDraft } = await import("#mutations/assignment/actions/saveScheduleAssignmentDraft");
    const result = await saveScheduleAssignmentDraft({
      scheduleId: "schedule-1",
      assignments: [{ scheduleRoleSlotId: "slot-1", workerUserId: "worker-1" }],
    });

    expect(replaceScheduleAssignmentDraft).toHaveBeenCalledWith({
      scheduleId: "schedule-1",
      assignments: [{ scheduleRoleSlotId: "slot-1", workerUserId: "worker-1" }],
    });
    expect(revalidateTag).toHaveBeenCalledWith("assignments:detail:schedule-1", "max");
    expect(revalidateTag).toHaveBeenCalledWith("schedules:admin-list", "max");
    expect(result).toHaveLength(1);
  });

  it("rejects non-admin callers with FORBIDDEN", async () => {
    requireAdminUser.mockRejectedValue(new Error("FORBIDDEN"));

    const { saveScheduleAssignmentDraft } = await import("#mutations/assignment/actions/saveScheduleAssignmentDraft");

    await expect(
      saveScheduleAssignmentDraft({
        scheduleId: "schedule-1",
        assignments: [{ scheduleRoleSlotId: "slot-1", workerUserId: "worker-1" }],
      }),
    ).rejects.toThrow("FORBIDDEN");

    expect(replaceScheduleAssignmentDraft).not.toHaveBeenCalled();
  });
});
