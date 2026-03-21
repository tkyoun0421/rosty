import type { ProfileSetupFormValues } from '@/features/auth/model/profile-setup';
import type { SettingsProfile } from '@/features/settings/api/fetch-settings-profile';

export function createSettingsProfileFormValues(
  profile: SettingsProfile | null,
  displayName: string,
): ProfileSetupFormValues {
  if (!profile) {
    return {
      fullName: displayName,
      phoneNumber: '',
      gender: 'unspecified',
    };
  }

  return {
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber,
    gender: profile.gender,
  };
}
