import { describe, expect, it, vi } from "vitest";

const requireAdminUser = vi.fn();
const updateScheduleRecordStatus = vi.fn();
const revalidatePath = vi.fn();

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

vi.mock("#mutations/schedule/dal/scheduleDal", () => ({
  updateScheduleRecordStatus,
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

describe("updateScheduleStatus", () => {
  it("lets admins set recruiting, assigning, or confirmed on an existing schedule", async () => {
    requireAdminUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });
    updateScheduleRecordStatus.mockResolvedValue({
      id: "schedule-1",
      startsAt: "2026-04-01T09:00:00+09:00",
      endsAt: "2026-04-01T13:30:00+09:00",
      status: "assigning",
      createdBy: "admin-1",
      createdAt: "2026-03-31T00:00:00.000Z",
      updatedAt: "2026-03-31T01:00:00.000Z",
      roleSlots: [{ roleCode: "captain", headcount: 2 }],
    });

    const { updateScheduleStatus } = await import("#mutations/schedule/actions/updateScheduleStatus");
    const result = await updateScheduleStatus({
      scheduleId: "schedule-1",
      status: "assigning",
    });

    expect(updateScheduleRecordStatus).toHaveBeenCalledWith({
      scheduleId: "schedule-1",
      status: "assigning",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/schedules");
    expect(result.status).toBe("assigning");
  });

  it("rejects invalid enum values", async () => {
    requireAdminUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });

    const { updateScheduleStatus } = await import("#mutations/schedule/actions/updateScheduleStatus");

    await expect(
      updateScheduleStatus({
        scheduleId: "schedule-1",
        status: "published",
      }),
    ).rejects.toThrow();
    expect(updateScheduleRecordStatus).not.toHaveBeenCalled();
  });

  it("rejects non-admin callers with FORBIDDEN", async () => {
    requireAdminUser.mockRejectedValue(new Error("FORBIDDEN"));

    const { updateScheduleStatus } = await import("#mutations/schedule/actions/updateScheduleStatus");

    await expect(
      updateScheduleStatus({
        scheduleId: "schedule-1",
        status: "confirmed",
      }),
    ).rejects.toThrow("FORBIDDEN");
  });

  it("keeps transitions lightweight by only blocking obvious no-op status changes", async () => {
    requireAdminUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });
    updateScheduleRecordStatus
      .mockRejectedValueOnce(new Error("INVALID_STATUS_TRANSITION"))
      .mockResolvedValueOnce({
        id: "schedule-1",
        startsAt: "2026-04-01T09:00:00+09:00",
        endsAt: "2026-04-01T13:30:00+09:00",
        status: "assigning",
        createdBy: "admin-1",
        createdAt: "2026-03-31T00:00:00.000Z",
        updatedAt: "2026-03-31T01:00:00.000Z",
        roleSlots: [{ roleCode: "captain", headcount: 2 }],
      });

    const { updateScheduleStatus } = await import("#mutations/schedule/actions/updateScheduleStatus");

    await expect(
      updateScheduleStatus({
        scheduleId: "schedule-1",
        status: "recruiting",
      }),
    ).rejects.toThrow("INVALID_STATUS_TRANSITION");

    await expect(
      updateScheduleStatus({
        scheduleId: "schedule-1",
        status: "assigning",
      }),
    ).resolves.toMatchObject({
      status: "assigning",
    });
  });
});
