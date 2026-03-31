"use server";

import {
  bootstrapFirstAdmin,
  getIdentityAvatarUrl,
  getProfileByUserId,
  uploadProfileImage,
  upsertProfile,
} from "#mutations/auth/dal/authDal";
import {
  parseProfileImageFile,
  parseProfileOnboardingForm,
} from "#mutations/auth/schemas/profileOnboarding";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

export async function submitProfileOnboarding(formData: FormData) {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    throw new Error("UNAUTHORIZED");
  }

  const parsed = parseProfileOnboardingForm(formData);
  const existingProfile = await getProfileByUserId(user.id);
  const fallbackAvatarUrl = existingProfile?.avatarUrl ?? getIdentityAvatarUrl(user);
  const imageFile = parseProfileImageFile(formData);
  const avatarUrl = imageFile ? await uploadProfileImage({ userId: user.id, file: imageFile }) : fallbackAvatarUrl;

  if (!avatarUrl) {
    throw new Error("PROFILE_IMAGE_REQUIRED");
  }

  await upsertProfile({
    userId: user.id,
    email: user.email,
    fullName: parsed.fullName,
    gender: parsed.gender,
    birthDate: parsed.birthDate,
    avatarUrl,
  });
  await bootstrapFirstAdmin(user.id);

  return { success: true as const };
}
