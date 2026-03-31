import "server-only";

import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

interface ScheduleApplicationRow {
  schedule_id: string;
}

export async function listMyScheduleApplicationIds(workerUserId: string): Promise<string[]> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("schedule_applications")
    .select("schedule_id")
    .eq("worker_user_id", workerUserId);

  if (error) {
    throw error;
  }

  return ((data as ScheduleApplicationRow[] | null | undefined) ?? []).map((row) => row.schedule_id);
}
