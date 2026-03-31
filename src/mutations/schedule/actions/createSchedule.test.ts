import { describe, expect, it, vi } from "vitest";

const requireAdminUser = vi.fn();
const createScheduleRecord = vi.fn();

vi.mock("#queries/access/dal/requireAdminUser", () => ({
  requireAdminUser,
}));

vi.mock("#mutations/schedule/dal/scheduleDal", () => ({
  createScheduleRecord,
}));

describe("createSchedule", () => {
  it("rejects non-admin callers with FORBIDDEN", async () => {
    requireAdminUser.mockRejectedValue(new Error("FORBIDDEN"));

    const { createSchedule } = await import("#mutations/schedule/actions/createSchedule");

    await expect(
      createSchedule({
        date: "2026-04-01",
        startTime: "09:00",
        endTime: "13:30",
        roleSlots: [{ roleCode: "captain", headcount: "2" }],
      }),
    ).rejects.toThrow("FORBIDDEN");
  });

  it("creates a recruiting schedule for admins", async () => {
    requireAdminUser.mockResolvedValue({ id: "admin-1", email: "admin@example.com", role: "admin" });
    createScheduleRecord.mockResolvedValue({
      id: "schedule-1",
      startsAt: "2026-04-01T09:00:00+09:00",
      endsAt: "2026-04-01T13:30:00+09:00",
      status: "recruiting",
      createdBy: "admin-1",
      createdAt: "2026-03-31T00:00:00.000Z",
      updatedAt: "2026-03-31T00:00:00.000Z",
      roleSlots: [
        { roleCode: "captain", headcount: 2 },
        { roleCode: "server", headcount: 4 },
      ],
    });

    const { createSchedule } = await import("#mutations/schedule/actions/createSchedule");
    const result = await createSchedule({
      date: "2026-04-01",
      startTime: "09:00",
      endTime: "13:30",
      roleSlots: [
        { roleCode: "captain", headcount: "2" },
        { roleCode: "server", headcount: "4" },
      ],
    });

    expect(createScheduleRecord).toHaveBeenCalledWith({
      startsAt: "2026-04-01T09:00:00+09:00",
      endsAt: "2026-04-01T13:30:00+09:00",
      createdBy: "admin-1",
      roleSlots: [
        { roleCode: "captain", headcount: 2 },
        { roleCode: "server", headcount: 4 },
      ],
    });
    expect(result.status).toBe("recruiting");
  });
});
