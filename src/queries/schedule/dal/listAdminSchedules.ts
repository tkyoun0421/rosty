import "server-only";

import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";

interface ScheduleRoleSlotRow {
  role_code: string;
  headcount: number;
}

interface ScheduleRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AdminScheduleListItem["status"];
  schedule_role_slots: ScheduleRoleSlotRow[] | null;
}

export async function listAdminSchedules(): Promise<AdminScheduleListItem[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("id, starts_at, ends_at, status, schedule_role_slots(role_code, headcount)")
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const schedule = row as ScheduleRow;

    return {
      id: schedule.id,
      startsAt: schedule.starts_at,
      endsAt: schedule.ends_at,
      status: schedule.status,
      roleSlotSummary: (schedule.schedule_role_slots ?? []).map((slot) => ({
        roleCode: slot.role_code,
        headcount: slot.headcount,
      })),
    };
  });
}
