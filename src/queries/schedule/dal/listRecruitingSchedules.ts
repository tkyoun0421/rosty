import "server-only";

import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

export interface RecruitingScheduleListItem {
  id: string;
  startsAt: string;
  endsAt: string;
  status: "recruiting";
}

interface RecruitingScheduleRow {
  id: string;
  starts_at: string;
  ends_at: string;
  status: RecruitingScheduleListItem["status"];
}

export async function listRecruitingSchedules(): Promise<RecruitingScheduleListItem[]> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedules")
    .select("id, starts_at, ends_at, status")
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
  })) ?? [];
}
