"use server";

import {
  createAttendanceCheckInRecord,
  type AttendanceCheckInRecord,
} from "#mutations/attendance/dal/attendanceDal";
import {
  parseAttendanceCheckInInput,
  type AttendanceCheckInInput,
} from "#mutations/attendance/schemas/attendanceCheckIn";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";

export type CreateAttendanceCheckInResult =
  | {
      status: "success";
      attendance: AttendanceCheckInRecord;
    }
  | {
      status: "forbidden" | "duplicate" | "too_early" | "out_of_radius" | "assignment_not_found";
    };

function mapCreateAttendanceError(error: unknown): CreateAttendanceCheckInResult {
  if (!(error instanceof Error)) {
    throw error;
  }

  if (error.message === "ATTENDANCE_DUPLICATE") {
    return { status: "duplicate" };
  }

  if (error.message === "ATTENDANCE_TOO_EARLY") {
    return { status: "too_early" };
  }

  if (error.message === "ATTENDANCE_OUT_OF_RADIUS") {
    return { status: "out_of_radius" };
  }

  if (error.message === "ATTENDANCE_ASSIGNMENT_NOT_FOUND") {
    return { status: "assignment_not_found" };
  }

  throw error;
}

export async function createAttendanceCheckIn(input: AttendanceCheckInInput): Promise<CreateAttendanceCheckInResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return { status: "forbidden" };
  }

  const parsed = parseAttendanceCheckInInput(input);

  try {
    const attendance = await createAttendanceCheckInRecord({
      scheduleAssignmentId: parsed.scheduleAssignmentId,
      workerUserId: currentUser.id,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      accuracyMeters: parsed.accuracyMeters,
    });

    return {
      status: "success",
      attendance,
    };
  } catch (error) {
    return mapCreateAttendanceError(error);
  }
}