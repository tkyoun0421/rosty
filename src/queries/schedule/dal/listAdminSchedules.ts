import "server-only";

import { unstable_cache } from "next/cache";

import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";
import { cacheTags } from "#shared/config/cacheTags";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

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

async function runListAdminSchedules(options: { useAdminClient: boolean }): Promise<AdminScheduleListItem[]> {
  const supabase = options.useAdminClient
    ? getAdminSupabaseClient()
    : await getServerSupabaseClient();
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

const listAdminSchedulesCached = unstable_cache(runListAdminSchedules, ["queries:schedule:listAdminSchedules"], {
  tags: [cacheTags.schedules.all, cacheTags.schedules.adminList],
});

export async function listAdminSchedules(): Promise<AdminScheduleListItem[]> {
  const useAdminClient = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const canUseAdminCache =
    useAdminClient && !process.env.VITEST && process.env.NODE_ENV === "production";

  if (!canUseAdminCache) {
    return await runListAdminSchedules({ useAdminClient });
  }

  return await listAdminSchedulesCached({ useAdminClient: true });
}
