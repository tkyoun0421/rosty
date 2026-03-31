import "server-only";

import type { WorkerRateRecord } from "#shared/model/access";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";

export async function listWorkerRates(): Promise<WorkerRateRecord[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("worker_rates")
    .select("user_id, hourly_rate_cents, updated_by, updated_at");

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    hourlyRateCents: row.hourly_rate_cents,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  }));
}

