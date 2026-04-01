import "server-only";

import { unstable_cache } from "next/cache";

import type {
  AdminAttendanceStatus,
  AdminScheduleAttendanceDetail,
} from "#queries/attendance/types/adminScheduleAttendanceDetail";
import { cacheTags } from "#shared/config/cacheTags";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

interface AttendanceCheckInRow {
  checked_in_at: string;
  is_late: boolean;
}

interface AssignmentProfileRow {
  full_name: string | null;
}

interface AssignmentRoleSlotRow {
  id: string;
  role_code: string | null;
}

interface AssignmentRow {
  id: string;
  worker_user_id: string;
  schedule_role_slot_id: string;
  status: "draft" | "confirmed";
  profiles: AssignmentProfileRow | AssignmentProfileRow[] | null;
  schedule_role_slots: AssignmentRoleSlotRow | null;
  attendance_check_ins: AttendanceCheckInRow[] | null;
}

interface ScheduleRow {
  id: string;
  starts_at: string;
  ends_at: string;
  schedule_assignments: AssignmentRow[] | null;
}

interface GetAdminScheduleAttendanceDetailOptions {
  now?: Date;
}

const TEN_AM_START_HOUR = 10;
const FIXED_TEN_AM_LEAD_MINUTES = 100;
const LATER_START_LEAD_MINUTES = 110;

function calculateScheduleOpenTime(scheduleStartsAt: string) {
  const startsAt = new Date(scheduleStartsAt);
  const startsAtMs = startsAt.getTime();

  if (Number.isNaN(startsAtMs)) {
    throw new Error("INVALID_SCHEDULE_START");
  }

  const opensAt =
    startsAt.getHours() === TEN_AM_START_HOUR
      ? new Date(startsAtMs - FIXED_TEN_AM_LEAD_MINUTES * 60 * 1000)
      : new Date(startsAtMs - LATER_START_LEAD_MINUTES * 60 * 1000);

  return {
    startsAt,
    opensAt,
  };
}

function getProfileName(profile: AssignmentRow["profiles"]): string | null {
  if (Array.isArray(profile)) {
    return profile[0]?.full_name ?? null;
  }

  return profile?.full_name ?? null;
}

function mapWorkerStatus(input: {
  attendance: AttendanceCheckInRow | null;
  opensAt: Date;
  now: Date;
}): AdminAttendanceStatus {
  if (input.attendance) {
    return input.attendance.is_late ? "late" : "checked_in";
  }

  return input.now.getTime() < input.opensAt.getTime() ? "not_open_yet" : "not_checked_in";
}

function mapAttendanceDetail(
  row: ScheduleRow,
  options: GetAdminScheduleAttendanceDetailOptions = {},
): AdminScheduleAttendanceDetail {
  const now = options.now ?? new Date();
  const { opensAt } = calculateScheduleOpenTime(row.starts_at);
  const workers = (row.schedule_assignments ?? [])
    .filter((assignment) => assignment.status === "confirmed")
    .map((assignment) => {
    const attendance = assignment.attendance_check_ins?.[0] ?? null;
    const status = mapWorkerStatus({ attendance, opensAt, now });

    return {
      scheduleAssignmentId: assignment.id,
      workerUserId: assignment.worker_user_id,
      workerName: getProfileName(assignment.profiles),
      roleSlotId: assignment.schedule_role_slot_id,
      roleCode: assignment.schedule_role_slots?.role_code ?? null,
      status,
      checkedInAt: attendance?.checked_in_at ?? null,
      isLate: attendance?.is_late ?? false,
    };
    });

  return {
    schedule: {
      id: row.id,
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      opensAt: opensAt.toISOString(),
    },
    summary: {
      confirmedWorkerCount: workers.length,
      checkedInCount: workers.filter((worker) => worker.status === "checked_in").length,
      lateCount: workers.filter((worker) => worker.status === "late").length,
      notCheckedInCount: workers.filter((worker) => worker.status === "not_checked_in").length,
      notOpenYetCount: workers.filter((worker) => worker.status === "not_open_yet").length,
    },
    workers,
  };
}

async function runGetAdminScheduleAttendanceDetail(
  scheduleId: string,
  options: GetAdminScheduleAttendanceDetailOptions = {},
  clientOptions: { useAdminClient: boolean },
): Promise<AdminScheduleAttendanceDetail | null> {
  const supabase = clientOptions.useAdminClient
    ? getAdminSupabaseClient()
    : await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select(
      [
        "id",
        "starts_at",
        "ends_at",
        "schedule_assignments!left(id, worker_user_id, schedule_role_slot_id, status, profiles(full_name), schedule_role_slots(id, role_code), attendance_check_ins(checked_in_at, is_late))",
      ].join(", "),
    )
    .eq("id", scheduleId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapAttendanceDetail(data as unknown as ScheduleRow, options);
}

export async function getAdminScheduleAttendanceDetail(
  scheduleId: string,
  options: GetAdminScheduleAttendanceDetailOptions = {},
): Promise<AdminScheduleAttendanceDetail | null> {
  const useAdminClient = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const canUseAdminCache = useAdminClient && !process.env.VITEST && !options.now;

  if (!canUseAdminCache) {
    return await runGetAdminScheduleAttendanceDetail(scheduleId, options, {
      useAdminClient,
    });
  }

  const cachedQuery = unstable_cache(
    async () =>
      await runGetAdminScheduleAttendanceDetail(scheduleId, undefined, {
        useAdminClient: true,
      }),
    ["queries:attendance:getAdminScheduleAttendanceDetail", scheduleId],
    {
      tags: [cacheTags.attendance.all, cacheTags.attendance.scheduleDetail(scheduleId)],
    },
  );

  return await cachedQuery();
}
