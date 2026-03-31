import "server-only";

import { unstable_cache } from "next/cache";

import { calculateAttendanceWindow } from "#mutations/attendance/utils/calculateAttendanceWindow";
import { listConfirmedWorkerAssignments } from "#queries/assignment/dal/listConfirmedWorkerAssignments";
import type { WorkerAttendanceStatus } from "#queries/attendance/types/workerAttendanceStatus";
import { cacheTags } from "#shared/config/cacheTags";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

interface AttendanceStatusRow {
  schedule_assignment_id: string;
  schedule_id: string;
  checked_in_at: string;
  is_late: boolean;
}

function mapWorkerAttendanceStatus(input: {
  assignmentId: string;
  scheduleId: string;
  startsAt: string;
  attendance: AttendanceStatusRow | undefined;
  now: Date;
}): WorkerAttendanceStatus {
  const { opensAt } = calculateAttendanceWindow(input.startsAt);

  if (input.attendance) {
    return {
      assignmentId: input.assignmentId,
      scheduleId: input.scheduleId,
      checkInOpensAt: opensAt.toISOString(),
      windowStatus: "submitted",
      submissionStatus: "submitted",
      checkedInAt: input.attendance.checked_in_at,
      isLate: input.attendance.is_late,
    };
  }

  return {
    assignmentId: input.assignmentId,
    scheduleId: input.scheduleId,
    checkInOpensAt: opensAt.toISOString(),
    windowStatus: input.now.getTime() >= opensAt.getTime() ? "open" : "not_open_yet",
    submissionStatus: "not_submitted",
    checkedInAt: null,
    isLate: null,
  };
}

async function runListWorkerAttendanceStatuses(
  workerUserId: string,
  now: Date,
): Promise<WorkerAttendanceStatus[]> {
  const assignments = await listConfirmedWorkerAssignments(workerUserId);

  if (assignments.length === 0) {
    return [];
  }

  const assignmentIds = assignments.map((assignment) => assignment.assignmentId);
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_check_ins")
    .select("schedule_assignment_id, schedule_id, checked_in_at, is_late")
    .eq("worker_user_id", workerUserId)
    .in("schedule_assignment_id", assignmentIds);

  if (error) {
    throw error;
  }

  const attendanceByAssignmentId = new Map(
    (((data as AttendanceStatusRow[] | null | undefined) ?? [])).map((row) => [row.schedule_assignment_id, row]),
  );

  return assignments.map((assignment) =>
    mapWorkerAttendanceStatus({
      assignmentId: assignment.assignmentId,
      scheduleId: assignment.scheduleId,
      startsAt: assignment.startsAt,
      attendance: attendanceByAssignmentId.get(assignment.assignmentId),
      now,
    }),
  );
}

export async function listWorkerAttendanceStatuses(
  workerUserId: string,
  now = new Date(),
): Promise<WorkerAttendanceStatus[]> {
  if (process.env.VITEST) {
    return await runListWorkerAttendanceStatuses(workerUserId, now);
  }

  const cachedQuery = unstable_cache(
    async () => await runListWorkerAttendanceStatuses(workerUserId, now),
    ["queries:attendance:listWorkerAttendanceStatuses", workerUserId, now.toISOString()],
    {
      tags: [cacheTags.attendance.all, cacheTags.attendance.worker(workerUserId)],
    },
  );

  return await cachedQuery();
}