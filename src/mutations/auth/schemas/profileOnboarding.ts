import { z } from "zod";

export const profileOnboardingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(80, "Full name is too long."),
  gender: z.enum(["male", "female", "other"]),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date is required."),
});

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function parseProfileOnboardingForm(formData: FormData) {
  return profileOnboardingSchema.parse({
    fullName: String(formData.get("fullName") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
  });
}

export function parseProfileImageFile(formData: FormData) {
  const value = formData.get("avatar");

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.has(value.type)) {
    throw new Error("PROFILE_IMAGE_INVALID_TYPE");
  }

  if (value.size > MAX_IMAGE_SIZE) {
    throw new Error("PROFILE_IMAGE_TOO_LARGE");
  }

  return value;
}
