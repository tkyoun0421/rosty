import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
const getCurrentUser = vi.fn();
const createAttendanceCheckInRecord = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag,
}));

vi.mock("#queries/access/dal/getCurrentUser", () => ({
  getCurrentUser,
}));

vi.mock("#mutations/attendance/dal/attendanceDal", () => ({
  createAttendanceCheckInRecord,
}));

describe("createAttendanceCheckIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized users and non-worker callers before touching the DAL", async () => {
    const { createAttendanceCheckIn } = await import("#mutations/attendance/actions/createAttendanceCheckIn");

    getCurrentUser.mockResolvedValueOnce(null);
    await expect(
      createAttendanceCheckIn({
        scheduleAssignmentId: "assignment-1",
        latitude: 37.5001,
        longitude: 127.0301,
      }),
    ).resolves.toEqual({
      status: "forbidden",
    });

    getCurrentUser.mockResolvedValueOnce({
      id: "admin-1",
      email: "admin@example.com",
      role: "admin",
    });
    await expect(
      createAttendanceCheckIn({
        scheduleAssignmentId: "assignment-1",
        latitude: 37.5001,
        longitude: 127.0301,
      }),
    ).resolves.toEqual({
      status: "forbidden",
    });

    expect(createAttendanceCheckInRecord).not.toHaveBeenCalled();
  });

  it("maps a successful worker submit to a stable success result", async () => {
    getCurrentUser.mockResolvedValue({
      id: "worker-1",
      email: "worker@example.com",
      role: "worker",
    });
    createAttendanceCheckInRecord.mockResolvedValue({
      id: "check-in-1",
      scheduleAssignmentId: "assignment-1",
      scheduleId: "schedule-1",
      workerUserId: "worker-1",
      checkedInAt: "2026-04-02T23:30:00.000Z",
      submittedLatitude: 37.5001,
      submittedLongitude: 127.0301,
      accuracyMeters: null,
      distanceMeters: 14,
      allowedRadiusMeters: 120,
      withinAllowedRadius: true,
      isLate: false,
      createdAt: "2026-04-02T23:30:00.000Z",
    });

    const { createAttendanceCheckIn } = await import("#mutations/attendance/actions/createAttendanceCheckIn");
    const result = await createAttendanceCheckIn({
      scheduleAssignmentId: "assignment-1",
      latitude: 37.5001,
      longitude: 127.0301,
    });

    expect(createAttendanceCheckInRecord).toHaveBeenCalledWith({
      scheduleAssignmentId: "assignment-1",
      workerUserId: "worker-1",
      latitude: 37.5001,
      longitude: 127.0301,
      accuracyMeters: undefined,
    });
    expect(result).toEqual({
      status: "success",
      attendance: {
        id: "check-in-1",
        scheduleAssignmentId: "assignment-1",
        scheduleId: "schedule-1",
        workerUserId: "worker-1",
        checkedInAt: "2026-04-02T23:30:00.000Z",
        submittedLatitude: 37.5001,
        submittedLongitude: 127.0301,
        accuracyMeters: null,
        distanceMeters: 14,
        allowedRadiusMeters: 120,
        withinAllowedRadius: true,
        isLate: false,
        createdAt: "2026-04-02T23:30:00.000Z",
      },
    });
  });

  it("maps duplicate, too-early, and out-of-radius failures to stable result codes", async () => {
    getCurrentUser.mockResolvedValue({
      id: "worker-1",
      email: "worker@example.com",
      role: "worker",
    });

    const { createAttendanceCheckIn } = await import("#mutations/attendance/actions/createAttendanceCheckIn");

    createAttendanceCheckInRecord.mockRejectedValueOnce(new Error("ATTENDANCE_DUPLICATE"));
    await expect(
      createAttendanceCheckIn({
        scheduleAssignmentId: "assignment-1",
        latitude: 37.5001,
        longitude: 127.0301,
      }),
    ).resolves.toEqual({
      status: "duplicate",
    });

    createAttendanceCheckInRecord.mockRejectedValueOnce(new Error("ATTENDANCE_TOO_EARLY"));
    await expect(
      createAttendanceCheckIn({
        scheduleAssignmentId: "assignment-1",
        latitude: 37.5001,
        longitude: 127.0301,
      }),
    ).resolves.toEqual({
      status: "too_early",
    });

    createAttendanceCheckInRecord.mockRejectedValueOnce(new Error("ATTENDANCE_OUT_OF_RADIUS"));
    await expect(
      createAttendanceCheckIn({
        scheduleAssignmentId: "assignment-1",
        latitude: 37.5001,
        longitude: 127.0301,
      }),
    ).resolves.toEqual({
      status: "out_of_radius",
    });
  });
});

describe("submitAttendanceCheckIn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates worker-confirmed and attendance cache tags on success", async () => {
    getCurrentUser.mockResolvedValue({
      id: "worker-1",
      email: "worker@example.com",
      role: "worker",
    });
    createAttendanceCheckInRecord.mockResolvedValue({
      id: "check-in-1",
      scheduleAssignmentId: "assignment-1",
      scheduleId: "schedule-1",
      workerUserId: "worker-1",
      checkedInAt: "2026-04-02T23:30:00.000Z",
      submittedLatitude: 37.5001,
      submittedLongitude: 127.0301,
      accuracyMeters: null,
      distanceMeters: 14,
      allowedRadiusMeters: 120,
      withinAllowedRadius: true,
      isLate: false,
      createdAt: "2026-04-02T23:30:00.000Z",
    });

    const { submitAttendanceCheckIn } = await import("#mutations/attendance/actions/submitAttendanceCheckIn");
    const formData = new FormData();
    formData.set("scheduleAssignmentId", "assignment-1");
    formData.set("latitude", "37.5001");
    formData.set("longitude", "127.0301");

    const result = await submitAttendanceCheckIn(formData);

    expect(result).toEqual({
      status: "success",
      attendance: expect.any(Object),
    });
    expect(revalidateTag).toHaveBeenCalledWith("attendance", "max");
    expect(revalidateTag).toHaveBeenCalledWith("attendance:worker:worker-1", "max");
    expect(revalidateTag).toHaveBeenCalledWith("attendance:schedule:schedule-1", "max");
    expect(revalidateTag).toHaveBeenCalledWith("assignments:worker-confirmed:worker-1", "max");
  });
});
