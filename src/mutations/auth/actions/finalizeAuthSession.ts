"use server";

import { acceptInvite } from "#mutations/invite/actions/acceptInvite";
import {
  getIdentityAvatarUrl,
  getIdentityFullName,
} from "#mutations/auth/dal/authDal";
import { ONBOARDING_PATH, ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";
import type { ProfileGender } from "#shared/model/access";
import { isProfileComplete } from "#queries/access/utils/profileCompleteness";

function normalizeGender(value: unknown): ProfileGender | null {
  return value === "male" || value === "female" || value === "other" ? value : null;
}

export async function finalizeAuthSession(inviteToken?: string) {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return SIGN_IN_PATH;
  }

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, gender, birth_date, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const fullName = existingProfile?.full_name ?? getIdentityFullName(user);
  const gender = normalizeGender(existingProfile?.gender);
  const birthDate = existingProfile?.birth_date ?? null;
  const avatarUrl = existingProfile?.avatar_url ?? getIdentityAvatarUrl(user);

  const { error: upsertError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: fullName,
    gender,
    birth_date: birthDate,
    avatar_url: avatarUrl,
  });

  if (upsertError) {
    throw upsertError;
  }

  if (inviteToken) {
    await acceptInvite(inviteToken);
  } else {
    const { error: bootstrapError } = await supabase.rpc("bootstrap_first_admin", {
      target_user_id: user.id,
    });

    if (bootstrapError) {
      throw bootstrapError;
    }
  }

  const nextProfile = {
    fullName,
    gender,
    birthDate,
    avatarUrl,
  };

  return isProfileComplete(nextProfile) ? ROOT_PATH : ONBOARDING_PATH;
}