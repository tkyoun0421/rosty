import "server-only";

import { unstable_cache } from "next/cache";

import { cacheTags } from "#shared/config/cacheTags";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

export interface RecruitingScheduleRoleSlotSummary {
  roleCode: string;
  headcount: number;
}

export interface RecruitingScheduleListItem {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "recruiting";
  roleSlotSummary: RecruitingScheduleRoleSlotSummary[];
}

interface RecruitingScheduleRoleSlotRow {
  role_code: string;
  headcount: number;
}

interface RecruitingScheduleRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: RecruitingScheduleListItem["status"];
  schedule_role_slots: RecruitingScheduleRoleSlotRow[] | null;
}

async function runListRecruitingSchedules(): Promise<RecruitingScheduleListItem[]> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("id, starts_at, ends_at, status, schedule_role_slots(role_code, headcount)")
    .eq("status", "recruiting")
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as RecruitingScheduleRow[] | null | undefined)?.map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    roleSlotSummary:
      row.schedule_role_slots?.map((slot) => ({
        roleCode: slot.role_code,
        headcount: slot.headcount,
      })) ?? [],
  })) ?? [];
}

const listRecruitingSchedulesCached = unstable_cache(
  runListRecruitingSchedules,
  ["queries:schedule:listRecruitingSchedules"],
  {
    tags: [cacheTags.schedules.all, cacheTags.schedules.recruitingList],
  },
);

export async function listRecruitingSchedules(): Promise<RecruitingScheduleListItem[]> {
  if (process.env.VITEST) {
    return await runListRecruitingSchedules();
  }

  return await listRecruitingSchedulesCached();
}
