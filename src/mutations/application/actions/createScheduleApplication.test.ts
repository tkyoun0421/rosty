import { beforeEach, describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
const getRecruitingScheduleById = vi.fn();
const insertScheduleApplication = vi.fn();

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#mutations/application/dal/scheduleApplicationDal", () => ({
  getRecruitingScheduleById,
  insertScheduleApplication,
}));

describe("createScheduleApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows a worker to apply once to a recruiting schedule", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    getRecruitingScheduleById.mockResolvedValue({ id: "schedule-1", status: "recruiting" });
    insertScheduleApplication.mockResolvedValue({
      id: "application-1",
      scheduleId: "schedule-1",
      workerUserId: "worker-1",
      createdAt: "2026-04-01T00:00:00.000Z",
    });

    const { createScheduleApplication } = await import("#mutations/application/actions/createScheduleApplication");
    const result = await createScheduleApplication({ scheduleId: "schedule-1" });

    expect(getRecruitingScheduleById).toHaveBeenCalledWith("schedule-1");
    expect(insertScheduleApplication).toHaveBeenCalledWith({
      scheduleId: "schedule-1",
      workerUserId: "worker-1",
    });
    expect(result).toEqual({
      status: "applied",
      application: {
        id: "application-1",
        scheduleId: "schedule-1",
        workerUserId: "worker-1",
        createdAt: "2026-04-01T00:00:00.000Z",
      },
    });
  });

  it("rejects duplicate submissions cleanly", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    getRecruitingScheduleById.mockResolvedValue({ id: "schedule-1", status: "recruiting" });
    insertScheduleApplication.mockRejectedValue(new Error("ALREADY_APPLIED"));

    const { createScheduleApplication } = await import("#mutations/application/actions/createScheduleApplication");

    await expect(createScheduleApplication({ scheduleId: "schedule-1" })).resolves.toEqual({
      status: "already_applied",
    });
  });

  it("denies anonymous and non-worker callers", async () => {
    const { createScheduleApplication } = await import("#mutations/application/actions/createScheduleApplication");

    getCurrentUser.mockResolvedValueOnce(null);
    await expect(createScheduleApplication({ scheduleId: "schedule-1" })).rejects.toThrow("FORBIDDEN");

    getCurrentUser.mockResolvedValueOnce({ id: "admin-1", email: "admin@example.com", role: "admin" });
    await expect(createScheduleApplication({ scheduleId: "schedule-1" })).rejects.toThrow("FORBIDDEN");

    expect(getRecruitingScheduleById).not.toHaveBeenCalled();
    expect(insertScheduleApplication).not.toHaveBeenCalled();
  });

  it("never accepts or persists a chosen role", async () => {
    getCurrentUser.mockResolvedValue({ id: "worker-1", email: "worker@example.com", role: "worker" });
    getRecruitingScheduleById.mockResolvedValue({ id: "schedule-1", status: "recruiting" });
    insertScheduleApplication.mockResolvedValue({
      id: "application-1",
      scheduleId: "schedule-1",
      workerUserId: "worker-1",
      createdAt: "2026-04-01T00:00:00.000Z",
    });

    const { createScheduleApplication } = await import("#mutations/application/actions/createScheduleApplication");
    await createScheduleApplication({ scheduleId: "schedule-1", roleCode: "captain" } as never);

    expect(insertScheduleApplication).toHaveBeenCalledWith({
      scheduleId: "schedule-1",
      workerUserId: "worker-1",
    });
  });
});
