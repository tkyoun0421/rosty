import "server-only";

import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

export async function requireAdminUser() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error("FORBIDDEN");
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || data?.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return {
    id: user.id,
    email: user.email,
    role: "admin" as const,
  };
}
