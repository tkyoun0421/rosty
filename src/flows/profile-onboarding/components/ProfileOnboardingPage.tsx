import { redirect } from "next/navigation";

import { ProfileOnboardingForm } from "#mutations/auth/components/ProfileOnboardingForm";
import { ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";
import { getCurrentUserProfile } from "#queries/access/dal/getCurrentUserProfile";

export async function ProfileOnboardingPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(SIGN_IN_PATH);
  }

  if (profile.isProfileComplete) {
    redirect(ROOT_PATH);
  }

  return (
    <main>
      <h1>회원 정보를 입력해 주세요.</h1>
      <p>이름, 성별, 생년월일, 프로필 사진을 입력하면 계속 진행할 수 있습니다.</p>
      <ProfileOnboardingForm
        avatarUrl={profile.avatarUrl}
        birthDate={profile.birthDate}
        fullName={profile.fullName}
        gender={profile.gender}
      />
    </main>
  );
}
