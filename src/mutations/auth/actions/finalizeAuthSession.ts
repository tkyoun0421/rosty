"use server";

import { acceptInvite } from "#mutations/invite/actions/acceptInvite";
import {
  bootstrapFirstAdmin,
  getIdentityAvatarUrl,
  getIdentityFullName,
  getProfileByUserId,
  upsertProfile,
} from "#mutations/auth/dal/authDal";
import { ONBOARDING_PATH, ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";
import { isProfileComplete } from "#queries/access/utils/profileCompleteness";

export async function finalizeAuthSession(inviteToken?: string) {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return SIGN_IN_PATH;
  }

  const existingProfile = await getProfileByUserId(user.id);
  const fullName = existingProfile?.fullName ?? getIdentityFullName(user);
  const avatarUrl = existingProfile?.avatarUrl ?? getIdentityAvatarUrl(user);

  await upsertProfile({
    userId: user.id,
    email: user.email,
    fullName,
    gender: existingProfile?.gender ?? null,
    birthDate: existingProfile?.birthDate ?? null,
    avatarUrl,
  });

  if (inviteToken) {
    await acceptInvite(inviteToken);
  } else {
    await bootstrapFirstAdmin(user.id);
  }

  const nextProfile = (await getProfileByUserId(user.id)) ?? {
    fullName,
    gender: null,
    birthDate: null,
    avatarUrl,
  };

  return isProfileComplete(nextProfile) ? ROOT_PATH : ONBOARDING_PATH;
}
