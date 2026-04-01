import { beforeEach, describe, expect, it, vi } from "vitest";

const createAttendanceCheckIn = vi.fn();
const revalidateTag = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag,
}));

vi.mock("#mutations/attendance/actions/createAttendanceCheckIn", () => ({
  createAttendanceCheckIn,
}));

function createFormData() {
  const formData = new FormData();
  formData.set("scheduleAssignmentId", "assignment-1");
  formData.set("latitude", "37.5");
  formData.set("longitude", "127.0");
  formData.set("accuracyMeters", "15");
  return formData;
}

describe("submitAttendanceCheckIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates attendance, assignment, and dashboard tags after a successful check-in", async () => {
    createAttendanceCheckIn.mockResolvedValue({
      status: "success",
      attendance: {
        id: "check-in-1",
        scheduleId: "schedule-1",
        scheduleAssignmentId: "assignment-1",
        workerUserId: "worker-1",
        checkedInAt: "2026-04-02T08:30:00.000Z",
        latitude: 37.5,
        longitude: 127,
        accuracyMeters: 15,
        isLate: false,
        createdAt: "2026-04-02T08:30:00.000Z",
      },
    });

    const { submitAttendanceCheckIn } = await import("#mutations/attendance/actions/submitAttendanceCheckIn");
    const result = await submitAttendanceCheckIn(createFormData());

    expect(result).toMatchObject({ status: "success" });
    expect(revalidateTag).toHaveBeenCalledWith("attendance", "max");
    expect(revalidateTag).toHaveBeenCalledWith("attendance:worker:worker-1", "max");
    expect(revalidateTag).toHaveBeenCalledWith("attendance:schedule:schedule-1", "max");
    expect(revalidateTag).toHaveBeenCalledWith("assignments:worker-confirmed:worker-1", "max");
    expect(revalidateTag).toHaveBeenCalledWith("dashboard", "max");
    expect(revalidateTag).toHaveBeenCalledWith("dashboard:admin-operations", "max");
  });

  it("does not revalidate tags when the check-in is rejected", async () => {
    createAttendanceCheckIn.mockResolvedValue({ status: "too_early" });

    const { submitAttendanceCheckIn } = await import("#mutations/attendance/actions/submitAttendanceCheckIn");
    const result = await submitAttendanceCheckIn(createFormData());

    expect(result).toEqual({ status: "too_early" });
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});