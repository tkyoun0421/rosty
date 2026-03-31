import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminUser = vi.fn();
const updateScheduleRecordStatus = vi.fn();

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

vi.mock("#mutations/schedule/dal/scheduleDal", () => ({
  updateScheduleRecordStatus,
}));

describe("updateScheduleStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets admins move schedules between recruiting and assigning", async () => {
    requireAdminUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });
    updateScheduleRecordStatus
      .mockResolvedValueOnce({
        id: "schedule-1",
        startsAt: "2026-04-01T09:00:00+09:00",
        endsAt: "2026-04-01T13:30:00+09:00",
        status: "assigning",
        createdBy: "admin-1",
        createdAt: "2026-03-31T00:00:00.000Z",
        updatedAt: "2026-03-31T01:00:00.000Z",
        roleSlots: [{ roleCode: "captain", headcount: 2 }],
      })
      .mockResolvedValueOnce({
        id: "schedule-1",
        startsAt: "2026-04-01T09:00:00+09:00",
        endsAt: "2026-04-01T13:30:00+09:00",
        status: "recruiting",
        createdBy: "admin-1",
        createdAt: "2026-03-31T00:00:00.000Z",
        updatedAt: "2026-03-31T01:00:00.000Z",
        roleSlots: [{ roleCode: "captain", headcount: 2 }],
      });

    const { updateScheduleStatus } = await import("#mutations/schedule/actions/updateScheduleStatus");

    await expect(
      updateScheduleStatus({
        scheduleId: "schedule-1",
        status: "assigning",
      }),
    ).resolves.toMatchObject({
      status: "assigning",
    });

    await expect(
      updateScheduleStatus({
        scheduleId: "schedule-1",
        status: "recruiting",
      }),
    ).resolves.toMatchObject({
      status: "recruiting",
    });
  });

  it("rejects direct confirmed transitions so only explicit assignment confirm can publish", async () => {
    requireAdminUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });

    const { updateScheduleStatus } = await import("#mutations/schedule/actions/updateScheduleStatus");

    await expect(
      updateScheduleStatus({
        scheduleId: "schedule-1",
        status: "confirmed",
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
        status: "assigning",
      }),
    ).rejects.toThrow("FORBIDDEN");
  });
});
