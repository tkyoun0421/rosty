import "server-only";

import type { AppRole } from "#shared/model/access";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

export interface CurrentUser {
  id: string;
  email: string;
  role: AppRole | null;
}

function normalizeRole(value: unknown): AppRole | null {
  return value === "admin" || value === "worker" ? value : null;
}

async function resolveDatabaseRole(userId: string) {
  const supabase = await getServerSupabaseClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return normalizeRole(data?.role);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const metadataRole =
    normalizeRole(user.app_metadata.user_role) ??
    normalizeRole(user.user_metadata.user_role) ??
    normalizeRole(user.user_metadata.role);

  let role = metadataRole ?? (await resolveDatabaseRole(user.id));

  if (!role) {
    const { data } = await supabase.rpc("bootstrap_first_admin", {
      target_user_id: user.id,
    });

    role = normalizeRole(data) ?? (await resolveDatabaseRole(user.id));
  }

  return {
    id: user.id,
    email: user.email,
    role,
  };
}