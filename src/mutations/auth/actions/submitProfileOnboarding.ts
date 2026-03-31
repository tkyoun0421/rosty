"use server";

import { revalidateTag } from "next/cache";

import { getIdentityAvatarUrl } from "#mutations/auth/dal/authDal";
import {
  parseProfileImageFile,
  parseProfileOnboardingForm,
} from "#mutations/auth/schemas/profileOnboarding";
import { cacheTags } from "#shared/config/cacheTags";
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
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw existingProfileError;
  }

  const fallbackAvatarUrl = existingProfile?.avatar_url ?? getIdentityAvatarUrl(user);
  const imageFile = parseProfileImageFile(formData);
  let avatarUrl = fallbackAvatarUrl;

  if (imageFile) {
    const fileExtension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${user.id}/${Date.now()}.${fileExtension}`;
    const arrayBuffer = await imageFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, Buffer.from(arrayBuffer), {
        contentType: imageFile.type,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    avatarUrl = supabase.storage.from("profile-images").getPublicUrl(filePath).data.publicUrl;
  }

  if (!avatarUrl) {
    throw new Error("PROFILE_IMAGE_REQUIRED");
  }

  const { error: upsertError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: parsed.fullName,
    gender: parsed.gender,
    birth_date: parsed.birthDate,
    avatar_url: avatarUrl,
  });

  if (upsertError) {
    throw upsertError;
  }

  revalidateTag(cacheTags.profile.onboarding(user.id), "max");

  return { success: true as const };
}