import "server-only";

import type { User } from "@supabase/supabase-js";

import type { AppRole, ProfileGender, UserProfileRecord } from "#shared/model/access";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";
import type { CurrentUserProfile } from "#queries/access/types/currentUserProfile";
import { isProfileComplete } from "#queries/access/utils/profileCompleteness";

function normalizeRole(value: unknown): AppRole | null {
  return value === "admin" || value === "worker" ? value : null;
}

function normalizeGender(value: unknown): ProfileGender | null {
  return value === "male" || value === "female" || value === "other" ? value : null;
}

function getMetadataString(user: User, keys: string[]) {
  for (const key of keys) {
    const value = user.user_metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function resolveProfile(user: User, profile: Partial<Record<"full_name" | "gender" | "birth_date" | "avatar_url", string | null>> | null): UserProfileRecord {
  return {
    fullName: profile?.full_name ?? getMetadataString(user, ["full_name", "name"]),
    gender: normalizeGender(profile?.gender),
    birthDate: profile?.birth_date ?? null,
    avatarUrl: profile?.avatar_url ?? getMetadataString(user, ["avatar_url", "picture"]),
  };
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
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

  const [{ data: profile }, roleResponse] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, gender, birth_date, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    metadataRole
      ? Promise.resolve({ data: { role: metadataRole } })
      : supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
  ]);

  const resolvedProfile = resolveProfile(user, profile);

  return {
    id: user.id,
    email: user.email,
    role: normalizeRole(roleResponse.data?.role) ?? metadataRole,
    ...resolvedProfile,
    isProfileComplete: isProfileComplete(resolvedProfile),
  };
}
