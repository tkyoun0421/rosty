import "server-only";

import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

export async function refreshCurrentSessionClaims() {
  if (process.env.VITEST || process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return;
  }

  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.auth.refreshSession();

  if (error) {
    throw error;
  }
}
