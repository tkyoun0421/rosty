import "server-only";

import { calculateAttendanceWindow } from "#mutations/attendance/utils/calculateAttendanceWindow";
import { calculateDistanceMeters } from "#mutations/attendance/utils/calculateDistanceMeters";
import { getAttendanceVenueConfig } from "#shared/config/attendance";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

const attendanceSelect = [
  "id",
  "schedule_assignment_id",
  "schedule_id",
  "worker_user_id",
  "checked_in_at",
  "submitted_latitude",
  "submitted_longitude",
  "accuracy_meters",
  "distance_meters",
  "allowed_radius_meters",
  "within_allowed_radius",
  "is_late",
  "created_at",
].join(", ");

interface AssignmentAttendanceRow {
  id: string;
  schedule_id: string;
  worker_user_id: string;
  status: "draft" | "confirmed";
  schedules: {
    starts_at: string;
  } | null;
}

interface AttendanceCheckInRow {
  id: string;
  schedule_assignment_id: string;
  schedule_id: string;
  worker_user_id: string;
  checked_in_at: string;
  submitted_latitude: number;
  submitted_longitude: number;
  accuracy_meters: number | null;
  distance_meters: number;
  allowed_radius_meters: number;
  within_allowed_radius: boolean;
  is_late: boolean;
  created_at: string;
}

export interface AttendanceCheckInRecord {
  id: string;
  scheduleAssignmentId: string;
  scheduleId: string;
  workerUserId: string;
  checkedInAt: string;
  submittedLatitude: number;
  submittedLongitude: number;
  accuracyMeters: number | null;
  distanceMeters: number;
  allowedRadiusMeters: number;
  withinAllowedRadius: boolean;
  isLate: boolean;
  createdAt: string;
}

export interface CreateAttendanceCheckInRecordInput {
  scheduleAssignmentId: string;
  workerUserId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

interface CreateAttendanceCheckInRecordOptions {
  checkedInAt?: Date;
}

function mapAttendanceCheckInRow(row: AttendanceCheckInRow): AttendanceCheckInRecord {
  return {
    id: row.id,
    scheduleAssignmentId: row.schedule_assignment_id,
    scheduleId: row.schedule_id,
    workerUserId: row.worker_user_id,
    checkedInAt: row.checked_in_at,
    submittedLatitude: row.submitted_latitude,
    submittedLongitude: row.submitted_longitude,
    accuracyMeters: row.accuracy_meters,
    distanceMeters: row.distance_meters,
    allowedRadiusMeters: row.allowed_radius_meters,
    withinAllowedRadius: row.within_allowed_radius,
    isLate: row.is_late,
    createdAt: row.created_at,
  };
}

function isDuplicateAttendanceError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeCode = "code" in error ? error.code : undefined;
  const maybeMessage = "message" in error ? error.message : undefined;

  return maybeCode === "23505" || maybeMessage === "ATTENDANCE_DUPLICATE";
}

async function getConfirmedAssignmentRow(scheduleAssignmentId: string, workerUserId: string) {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedule_assignments")
    .select("id, schedule_id, worker_user_id, status, schedules!inner(starts_at)")
    .eq("id", scheduleAssignmentId)
    .eq("worker_user_id", workerUserId)
    .eq("status", "confirmed")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as AssignmentAttendanceRow | null) ?? null;
}

export async function createAttendanceCheckInRecord(
  input: CreateAttendanceCheckInRecordInput,
  options: CreateAttendanceCheckInRecordOptions = {},
): Promise<AttendanceCheckInRecord> {
  const assignment = await getConfirmedAssignmentRow(input.scheduleAssignmentId, input.workerUserId);

  if (!assignment?.schedules?.starts_at) {
    throw new Error("ATTENDANCE_ASSIGNMENT_NOT_FOUND");
  }

  const checkedInAt = options.checkedInAt ?? new Date();
  const { opensAt, startsAt } = calculateAttendanceWindow(assignment.schedules.starts_at);

  if (checkedInAt.getTime() < opensAt.getTime()) {
    throw new Error("ATTENDANCE_TOO_EARLY");
  }

  const venueConfig = getAttendanceVenueConfig();
  const distanceMeters = Number(
    calculateDistanceMeters({
      originLatitude: venueConfig.venueLatitude,
      originLongitude: venueConfig.venueLongitude,
      targetLatitude: input.latitude,
      targetLongitude: input.longitude,
    }).toFixed(2),
  );

  if (distanceMeters > venueConfig.allowedRadiusMeters) {
    throw new Error("ATTENDANCE_OUT_OF_RADIUS");
  }

  const supabase = await getServerSupabaseClient();
  const checkedInAtIso = checkedInAt.toISOString();
  const { data, error } = await supabase
    .from("attendance_check_ins")
    .insert({
      schedule_assignment_id: assignment.id,
      schedule_id: assignment.schedule_id,
      worker_user_id: assignment.worker_user_id,
      checked_in_at: checkedInAtIso,
      submitted_latitude: input.latitude,
      submitted_longitude: input.longitude,
      accuracy_meters: input.accuracyMeters ?? null,
      distance_meters: distanceMeters,
      allowed_radius_meters: venueConfig.allowedRadiusMeters,
      within_allowed_radius: true,
      is_late: checkedInAt.getTime() > startsAt.getTime(),
    })
    .select(attendanceSelect)
    .single();

  if (error) {
    if (isDuplicateAttendanceError(error)) {
      throw new Error("ATTENDANCE_DUPLICATE");
    }

    throw error;
  }

  return mapAttendanceCheckInRow(data as unknown as AttendanceCheckInRow);
}