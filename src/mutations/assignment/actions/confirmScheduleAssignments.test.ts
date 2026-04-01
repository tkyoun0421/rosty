import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
const requireAdminUser = vi.fn();
const confirmScheduleAssignmentDraft = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag,
}));

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

vi.mock("#mutations/assignment/dal/assignmentDal", () => ({
  confirmScheduleAssignmentDraft,
}));

describe("confirmScheduleAssignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirms assignments, returns unfilled slots, and revalidates admin, dashboard, and worker-facing tags", async () => {
    requireAdminUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });
    confirmScheduleAssignmentDraft.mockResolvedValue({
      confirmedAssignments: [
        {
          id: "assignment-1",
          scheduleId: "schedule-1",
          scheduleRoleSlotId: "slot-1",
          workerUserId: "worker-1",
          status: "confirmed",
          confirmedAt: "2026-04-02T00:00:00.000Z",
          confirmedBy: "admin-1",
          createdAt: "2026-04-01T00:00:00.000Z",
          updatedAt: "2026-04-02T00:00:00.000Z",
        },
      ],
      unfilledSlotIds: ["slot-2"],
    });

    const { confirmScheduleAssignments } = await import("#mutations/assignment/actions/confirmScheduleAssignments");
    const result = await confirmScheduleAssignments({
      scheduleId: "schedule-1",
    });

    expect(confirmScheduleAssignmentDraft).toHaveBeenCalledWith({
      scheduleId: "schedule-1",
      confirmedBy: "admin-1",
    });
    expect(result.unfilledSlotIds).toEqual(["slot-2"]);
    expect(revalidateTag).toHaveBeenCalledWith("assignments:detail:schedule-1", "max");
    expect(revalidateTag).toHaveBeenCalledWith("schedules:admin-list", "max");
    expect(revalidateTag).toHaveBeenCalledWith("dashboard", "max");
    expect(revalidateTag).toHaveBeenCalledWith("dashboard:admin-operations", "max");
    expect(revalidateTag).toHaveBeenCalledWith("assignments:worker-confirmed:worker-1", "max");
    expect(revalidateTag).toHaveBeenCalledWith("assignments:worker-pay-preview:worker-1", "max");
  });

  it("rejects non-admin callers with FORBIDDEN", async () => {
    requireAdminUser.mockRejectedValue(new Error("FORBIDDEN"));

    const { confirmScheduleAssignments } = await import("#mutations/assignment/actions/confirmScheduleAssignments");

    await expect(
      confirmScheduleAssignments({
        scheduleId: "schedule-1",
      }),
    ).rejects.toThrow("FORBIDDEN");

    expect(confirmScheduleAssignmentDraft).not.toHaveBeenCalled();
  });
});