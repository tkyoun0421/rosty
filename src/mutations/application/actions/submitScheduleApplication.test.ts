import { beforeEach, describe, expect, it, vi } from "vitest";

const createScheduleApplication = vi.fn();
const revalidateTag = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag,
}));

vi.mock("#mutations/application/actions/createScheduleApplication", () => ({
  createScheduleApplication,
}));

function createFormData(scheduleId = "schedule-1") {
  const formData = new FormData();
  formData.set("scheduleId", scheduleId);
  return formData;
}

describe("submitScheduleApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates worker, admin detail, and dashboard tags after a successful apply", async () => {
    createScheduleApplication.mockResolvedValue({
      status: "applied",
      application: {
        id: "application-1",
        scheduleId: "schedule-1",
        workerUserId: "worker-1",
        createdAt: "2026-04-03T00:00:00.000Z",
      },
    });

    const { submitScheduleApplication } = await import(
      "#mutations/application/actions/submitScheduleApplication"
    );
    const result = await submitScheduleApplication(createFormData());

    expect(createScheduleApplication).toHaveBeenCalledWith({
      scheduleId: "schedule-1",
    });
    expect(result).toMatchObject({
      status: "applied",
    });
    expect(revalidateTag).toHaveBeenCalledTimes(6);
    expect(revalidateTag).toHaveBeenNthCalledWith(1, "applications", "max");
    expect(revalidateTag).toHaveBeenNthCalledWith(2, "applications:worker-schedule-ids", "max");
    expect(revalidateTag).toHaveBeenNthCalledWith(3, "schedules:recruiting-list", "max");
    expect(revalidateTag).toHaveBeenNthCalledWith(4, "assignments:detail:schedule-1", "max");
    expect(revalidateTag).toHaveBeenNthCalledWith(5, "dashboard", "max");
    expect(revalidateTag).toHaveBeenNthCalledWith(6, "dashboard:admin-operations", "max");
  });

  it("does not revalidate tags when the worker already applied", async () => {
    createScheduleApplication.mockResolvedValue({
      status: "already_applied",
    });

    const { submitScheduleApplication } = await import(
      "#mutations/application/actions/submitScheduleApplication"
    );
    const result = await submitScheduleApplication(createFormData());

    expect(result).toEqual({
      status: "already_applied",
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
