import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const insertSingle = vi.fn();
const insertSelect = vi.fn(() => ({ single: insertSingle }));
const insert = vi.fn(() => ({ select: insertSelect }));

const from = vi.fn((table: string) => {
  if (table === "schedule_assignments") {
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle,
            })),
          })),
        })),
      })),
    };
  }

  if (table === "attendance_check_ins") {
    return {
      insert,
    };
  }

  throw new Error(`Unexpected table: ${table}`);
});

const getServerSupabaseClient = vi.fn(async () => ({ from }));
const getAttendanceVenueConfig = vi.fn(() => ({
  venueLatitude: 37.5,
  venueLongitude: 127.03,
  allowedRadiusMeters: 120,
}));

vi.mock("#shared/lib/supabase/serverClient", () => ({
  getServerSupabaseClient,
}));

vi.mock("#shared/config/attendance", () => ({
  getAttendanceVenueConfig,
}));

describe("createAttendanceCheckInRecord", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    maybeSingle.mockResolvedValue({
      data: {
        id: "assignment-1",
        schedule_id: "schedule-1",
        worker_user_id: "worker-1",
        status: "confirmed",
        schedules: {
          starts_at: "2026-04-03T10:00:00+09:00",
        },
      },
      error: null,
    });
    insertSingle.mockResolvedValue({
      data: {
        id: "check-in-1",
        schedule_assignment_id: "assignment-1",
        schedule_id: "schedule-1",
        worker_user_id: "worker-1",
        checked_in_at: "2026-04-02T23:30:00.000Z",
        submitted_latitude: 37.5002,
        submitted_longitude: 127.0304,
        accuracy_meters: 9,
        distance_meters: 41.99,
        allowed_radius_meters: 120,
        within_allowed_radius: true,
        is_late: false,
        created_at: "2026-04-02T23:30:00.000Z",
      },
      error: null,
    });
  });

  it("creates one attendance row for an owned confirmed assignment and persists validation snapshots", async () => {
    const { createAttendanceCheckInRecord } = await import("#mutations/attendance/dal/attendanceDal");
    const result = await createAttendanceCheckInRecord(
      {
        scheduleAssignmentId: "assignment-1",
        workerUserId: "worker-1",
        latitude: 37.5002,
        longitude: 127.0304,
        accuracyMeters: 9,
      },
      {
        checkedInAt: new Date("2026-04-02T23:30:00.000Z"),
      },
    );

    expect(maybeSingle).toHaveBeenCalled();
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith({
      schedule_assignment_id: "assignment-1",
      schedule_id: "schedule-1",
      worker_user_id: "worker-1",
      checked_in_at: "2026-04-02T23:30:00.000Z",
      submitted_latitude: 37.5002,
      submitted_longitude: 127.0304,
      accuracy_meters: 9,
      distance_meters: expect.any(Number),
      allowed_radius_meters: 120,
      within_allowed_radius: true,
      is_late: false,
    });
    expect(result).toEqual({
      id: "check-in-1",
      scheduleAssignmentId: "assignment-1",
      scheduleId: "schedule-1",
      workerUserId: "worker-1",
      checkedInAt: "2026-04-02T23:30:00.000Z",
      submittedLatitude: 37.5002,
      submittedLongitude: 127.0304,
      accuracyMeters: 9,
      distanceMeters: 41.99,
      allowedRadiusMeters: 120,
      withinAllowedRadius: true,
      isLate: false,
      createdAt: "2026-04-02T23:30:00.000Z",
    });
  });

  it("returns a stable duplicate error instead of creating a second row", async () => {
    insertSingle.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      },
    });

    const { createAttendanceCheckInRecord } = await import("#mutations/attendance/dal/attendanceDal");

    await expect(
      createAttendanceCheckInRecord(
        {
          scheduleAssignmentId: "assignment-1",
          workerUserId: "worker-1",
          latitude: 37.5002,
          longitude: 127.0304,
        },
        {
          checkedInAt: new Date("2026-04-02T23:30:00.000Z"),
        },
      ),
    ).rejects.toThrow("ATTENDANCE_DUPLICATE");

    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("rejects submissions for missing or unowned confirmed assignments before insert", async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { createAttendanceCheckInRecord } = await import("#mutations/attendance/dal/attendanceDal");

    await expect(
      createAttendanceCheckInRecord(
        {
          scheduleAssignmentId: "assignment-1",
          workerUserId: "worker-9",
          latitude: 37.5002,
          longitude: 127.0304,
        },
        {
          checkedInAt: new Date("2026-04-02T23:30:00.000Z"),
        },
      ),
    ).rejects.toThrow("ATTENDANCE_ASSIGNMENT_NOT_FOUND");

    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects too-early submissions before insert", async () => {
    const { createAttendanceCheckInRecord } = await import("#mutations/attendance/dal/attendanceDal");

    await expect(
      createAttendanceCheckInRecord(
        {
          scheduleAssignmentId: "assignment-1",
          workerUserId: "worker-1",
          latitude: 37.5002,
          longitude: 127.0304,
        },
        {
          checkedInAt: new Date("2026-04-02T23:19:59.000Z"),
        },
      ),
    ).rejects.toThrow("ATTENDANCE_TOO_EARLY");

    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects out-of-radius submissions before insert", async () => {
    getAttendanceVenueConfig.mockReturnValue({
      venueLatitude: 37.5,
      venueLongitude: 127.03,
      allowedRadiusMeters: 10,
    });

    const { createAttendanceCheckInRecord } = await import("#mutations/attendance/dal/attendanceDal");

    await expect(
      createAttendanceCheckInRecord(
        {
          scheduleAssignmentId: "assignment-1",
          workerUserId: "worker-1",
          latitude: 37.5002,
          longitude: 127.0304,
        },
        {
          checkedInAt: new Date("2026-04-02T23:30:00.000Z"),
        },
      ),
    ).rejects.toThrow("ATTENDANCE_OUT_OF_RADIUS");

    expect(insert).not.toHaveBeenCalled();
  });
});
