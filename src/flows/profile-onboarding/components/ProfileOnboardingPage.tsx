import { redirect } from "next/navigation";

import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";
import { ProfileOnboardingForm } from "#mutations/auth/components/ProfileOnboardingForm";
import { getCurrentUserProfile } from "#queries/access/dal/getCurrentUserProfile";
import { ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";

export async function ProfileOnboardingPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return redirect(SIGN_IN_PATH);
  }

  if (profile.isProfileComplete) {
    return redirect(ROOT_PATH);
  }

  return (
    <EntrySurfaceFrame
      badge="Profile setup"
      title="Complete your profile"
      description="Add your full name, gender, birth date, and profile image before entering the workspace."
      contentClassName="gap-6"
    >
      <ProfileOnboardingForm
        avatarUrl={profile.avatarUrl}
        birthDate={profile.birthDate}
        fullName={profile.fullName}
        gender={profile.gender}
      />
    </EntrySurfaceFrame>
  );
}
