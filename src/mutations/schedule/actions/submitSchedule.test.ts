import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
const revalidatePath = vi.fn();
const createSchedule = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
  revalidateTag,
}));

vi.mock("#mutations/schedule/actions/createSchedule", () => ({
  createSchedule,
}));

describe("submitSchedule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates schedule and dashboard tags after creating a schedule", async () => {
    const { submitSchedule } = await import("#mutations/schedule/actions/submitSchedule");
    const formData = new FormData();
    formData.set("date", "2026-04-02");
    formData.set("startTime", "09:00");
    formData.set("endTime", "12:00");
    formData.append("roleCode", "host");
    formData.append("headcount", "2");

    await submitSchedule(formData);

    expect(createSchedule).toHaveBeenCalledWith({
      date: "2026-04-02",
      startTime: "09:00",
      endTime: "12:00",
      roleSlots: [{ roleCode: "host", headcount: "2" }],
    });
    expect(revalidateTag).toHaveBeenCalledWith("schedules", "max");
    expect(revalidateTag).toHaveBeenCalledWith("schedules:admin-list", "max");
    expect(revalidateTag).toHaveBeenCalledWith("schedules:recruiting-list", "max");
    expect(revalidateTag).toHaveBeenCalledWith("dashboard", "max");
    expect(revalidateTag).toHaveBeenCalledWith("dashboard:admin-operations", "max");
    expect(revalidatePath).not.toHaveBeenCalledWith("/admin");
  });
});