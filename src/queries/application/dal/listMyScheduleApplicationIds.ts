import "server-only";

import { unstable_cache } from "next/cache";

import { cacheTags } from "#shared/config/cacheTags";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

interface ScheduleApplicationRow {
  schedule_id: string;
}

async function runListMyScheduleApplicationIds(workerUserId: string): Promise<string[]> {
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

const listMyScheduleApplicationIdsCached = unstable_cache(
  runListMyScheduleApplicationIds,
  ["queries:application:listMyScheduleApplicationIds"],
  {
    tags: [cacheTags.applications.all, cacheTags.applications.workerScheduleIds],
  },
);

export async function listMyScheduleApplicationIds(workerUserId: string): Promise<string[]> {
  if (process.env.VITEST) {
    return await runListMyScheduleApplicationIds(workerUserId);
  }

  return await listMyScheduleApplicationIdsCached(workerUserId);
}