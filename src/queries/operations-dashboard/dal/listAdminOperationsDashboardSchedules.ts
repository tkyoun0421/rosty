import "server-only";

import { unstable_cache } from "next/cache";

import type { OperationsDashboardScheduleCard, OperationsDashboardSections } from "#queries/operations-dashboard/types/operationsDashboard";
import {
  getOperationsDashboardScheduleDisplay,
  getOperationsDashboardSections,
  getOperationsDashboardWindow,
  getTopOperationsDashboardAnomaly,
} from "#queries/operations-dashboard/utils/operationsDashboard";
import { cacheTags } from "#shared/config/cacheTags";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

interface AttendanceCheckInRow {
  checked_in_at: string;
  is_late: boolean;
}

interface ScheduleRoleSlotRow {
  id: string;
  role_code: string | null;
  headcount: number;
}

interface ScheduleApplicationRow {
  worker_user_id: string;
  created_at: string;
}

interface ScheduleAssignmentRow {
  id: string;
  worker_user_id: string;
  schedule_role_slot_id: string;
  status: "draft" | "confirmed";
  attendance_check_ins: AttendanceCheckInRow[] | null;
}

interface ScheduleRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  schedule_role_slots: ScheduleRoleSlotRow[] | null;
  schedule_applications: ScheduleApplicationRow[] | null;
  schedule_assignments: ScheduleAssignmentRow[] | null;
}

interface ListAdminOperationsDashboardSchedulesOptions {
  now?: Date;
}

function mapScheduleCard(row: ScheduleRow, now: Date): OperationsDashboardScheduleCard {
  const display = getOperationsDashboardScheduleDisplay({
    scheduleId: row.id,
    startsAtIso: row.starts_at,
  });
  const totalRoleSlots = (row.schedule_role_slots ?? []).length;
  const totalHeadcount = (row.schedule_role_slots ?? []).reduce(
    (sum, roleSlot) => sum + roleSlot.headcount,
    0,
  );
  const confirmedAssignments = (row.schedule_assignments ?? []).filter(
    (assignment) => assignment.status === "confirmed",
  );
  const checkedInCount = confirmedAssignments.filter((assignment) => {
    const checkIn = assignment.attendance_check_ins?.[0] ?? null;

    return Boolean(checkIn && !checkIn.is_late);
  }).length;
  const lateCount = confirmedAssignments.filter((assignment) => {
    const checkIn = assignment.attendance_check_ins?.[0] ?? null;

    return Boolean(checkIn?.is_late);
  }).length;
  const confirmedAssignmentCount = confirmedAssignments.length;
  const missingCheckInCount = Math.max(
    confirmedAssignmentCount - checkedInCount - lateCount,
    0,
  );
  const unfilledSlotCount = Math.max(totalHeadcount - confirmedAssignmentCount, 0);

  return {
    scheduleId: row.id,
    ...display,
    applicantCount: (row.schedule_applications ?? []).length,
    totalRoleSlots,
    totalHeadcount,
    confirmedAssignmentCount,
    checkedInCount,
    lateCount,
    missingCheckInCount,
    unfilledSlotCount,
    topAnomaly: getTopOperationsDashboardAnomaly({
      startsAtIso: row.starts_at,
      totalHeadcount,
      confirmedAssignmentCount,
      checkedInCount,
      lateCount,
      now,
    }),
  };
}

function mapOperationsDashboardRows(rows: ScheduleRow[], now: Date): OperationsDashboardSections {
  return getOperationsDashboardSections(
    rows.map((row) => mapScheduleCard(row, now)),
    now,
  );
}

async function runListAdminOperationsDashboardSchedules(window: {
  todayStartIso: string;
  upcomingEndIso: string;
}, options: {
  useAdminClient: boolean;
}): Promise<ScheduleRow[]> {
  const supabase = options.useAdminClient
    ? getAdminSupabaseClient()
    : await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select(
      [
        "id",
        "starts_at",
        "ends_at",
        "status",
        "schedule_role_slots(id, role_code, headcount)",
        "schedule_applications(worker_user_id, created_at)",
        "schedule_assignments(id, worker_user_id, schedule_role_slot_id, status, attendance_check_ins(checked_in_at, is_late))",
      ].join(", "),
    )
    .gte("starts_at", window.todayStartIso)
    .lt("starts_at", window.upcomingEndIso)
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ScheduleRow[];
}

export async function listAdminOperationsDashboardSchedules(
  options: ListAdminOperationsDashboardSchedulesOptions = {},
): Promise<OperationsDashboardSections> {
  const now = options.now ?? new Date();
  const window = getOperationsDashboardWindow(now);
  const canUseAdminCache = !process.env.VITEST && !options.now && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!canUseAdminCache) {
    const rows = await runListAdminOperationsDashboardSchedules({
      todayStartIso: window.todayStartIso,
      upcomingEndIso: window.upcomingEndIso,
    }, {
      useAdminClient: false,
    });

    return mapOperationsDashboardRows(rows, now);
  }

  const cachedQuery = unstable_cache(
    async () =>
      await runListAdminOperationsDashboardSchedules({
        todayStartIso: window.todayStartIso,
        upcomingEndIso: window.upcomingEndIso,
      }, {
        useAdminClient: true,
      }),
    [
      "queries:operations-dashboard:listAdminOperationsDashboardSchedules",
      window.todayStartIso,
      window.upcomingEndIso,
    ],
    {
      tags: [cacheTags.dashboard.all, cacheTags.dashboard.adminOperations],
    },
  );
  const rows = await cachedQuery();

  return mapOperationsDashboardRows(rows, now);
}
