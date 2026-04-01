import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const revalidateTag = vi.fn();
const updateScheduleStatus = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
}));

vi.mock("#mutations/schedule/actions/updateScheduleStatus", () => ({
  updateScheduleStatus,
}));

describe("submitScheduleStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates schedule and dashboard tags after a status update", async () => {
    const { submitScheduleStatus } = await import("#mutations/schedule/actions/submitScheduleStatus");
    const formData = new FormData();
    formData.set("scheduleId", "schedule-1");
    formData.set("status", "published");

    await submitScheduleStatus(formData);

    expect(updateScheduleStatus).toHaveBeenCalledWith(formData);
    expect(revalidateTag).toHaveBeenCalledWith("schedules", "max");
    expect(revalidateTag).toHaveBeenCalledWith("schedules:admin-list", "max");
    expect(revalidateTag).toHaveBeenCalledWith("schedules:recruiting-list", "max");
    expect(revalidateTag).toHaveBeenCalledWith("dashboard", "max");
    expect(revalidateTag).toHaveBeenCalledWith("dashboard:admin-operations", "max");
    expect(revalidatePath).not.toHaveBeenCalledWith("/admin");
  });
});