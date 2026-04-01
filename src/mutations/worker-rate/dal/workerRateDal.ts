import "server-only";

import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

async function getWorkerRateAdminMutationClient() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? getAdminSupabaseClient()
    : await getServerSupabaseClient();
}

export async function upsertWorkerRateRecord(input: {
  userId: string;
  hourlyRateCents: number;
  updatedBy: string;
}) {
  const supabase = await getWorkerRateAdminMutationClient();
  const { error } = await supabase.from("worker_rates").upsert({
    user_id: input.userId,
    hourly_rate_cents: input.hourlyRateCents,
    updated_by: input.updatedBy,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}
