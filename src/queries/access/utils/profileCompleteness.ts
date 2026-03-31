import type { UserProfileRecord } from "#shared/model/access";

export function isProfileComplete(profile: UserProfileRecord) {
  return Boolean(
    profile.fullName?.trim() &&
      profile.gender &&
      profile.birthDate &&
      profile.avatarUrl?.trim(),
  );
}
