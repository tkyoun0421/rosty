import "server-only";

import type { User } from "@supabase/supabase-js";

import type { AppRole, ProfileGender, UserProfileRecord } from "#shared/model/access";
import { getAdminSupabaseClient } from "#shared/lib/supabase/adminClient";

const PROFILE_IMAGE_BUCKET = "profile-images";

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

function getFileExtension(fileName: string, mimeType: string) {
  const lastSegment = fileName.split(".").pop()?.toLowerCase();

  if (lastSegment && /^[a-z0-9]+$/.test(lastSegment)) {
    return lastSegment;
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export function getIdentityFullName(user: User) {
  return getMetadataString(user, ["full_name", "name"]);
}

export function getIdentityAvatarUrl(user: User) {
  return getMetadataString(user, ["avatar_url", "picture"]);
}

export async function getProfileByUserId(userId: string): Promise<UserProfileRecord | null> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, gender, birth_date, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    fullName: data.full_name,
    gender: normalizeGender(data.gender),
    birthDate: data.birth_date,
    avatarUrl: data.avatar_url,
  };
}

export async function upsertProfile(input: {
  userId: string;
  email: string;
  fullName: string | null;
  gender: ProfileGender | null;
  birthDate: string | null;
  avatarUrl: string | null;
}) {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from("profiles").upsert({
    id: input.userId,
    email: input.email,
    full_name: input.fullName,
    gender: input.gender,
    birth_date: input.birthDate,
    avatar_url: input.avatarUrl,
  });

  if (error) {
    throw error;
  }
}

export async function bootstrapFirstAdmin(userId: string): Promise<AppRole | null> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.rpc("bootstrap_first_admin", {
    target_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return normalizeRole(data);
}

export async function uploadProfileImage(input: { userId: string; file: File }) {
  const supabase = getAdminSupabaseClient();
  const fileExtension = getFileExtension(input.file.name, input.file.type);
  const filePath = `${input.userId}/${Date.now()}.${fileExtension}`;
  const arrayBuffer = await input.file.arrayBuffer();
  const { error } = await supabase.storage
    .from(PROFILE_IMAGE_BUCKET)
    .upload(filePath, Buffer.from(arrayBuffer), {
      contentType: input.file.type,
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(filePath);

  return data.publicUrl;
}
