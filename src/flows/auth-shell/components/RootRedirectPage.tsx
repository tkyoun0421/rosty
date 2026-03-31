import { redirect } from "next/navigation";

import { ONBOARDING_PATH, SIGN_IN_PATH, UNAUTHORIZED_PATH } from "#shared/config/authConfig";
import { getCurrentUserProfile } from "#queries/access/dal/getCurrentUserProfile";

export async function RootRedirectPage() {
  const user = await getCurrentUserProfile();

  if (!user) {
    return redirect(SIGN_IN_PATH);
  }

  if (!user.isProfileComplete) {
    return redirect(ONBOARDING_PATH);
  }

  if (user.role === "admin") {
    return redirect("/admin");
  }

  if (user.role === "worker") {
    return redirect("/worker");
  }

  return redirect(UNAUTHORIZED_PATH);
}
