import { redirect } from "next/navigation";

import { SIGN_IN_PATH, UNAUTHORIZED_PATH } from "#shared/config/authConfig";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";

export async function RootRedirectPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect(SIGN_IN_PATH);
  }

  if (user.role === "admin") {
    return redirect("/admin");
  }

  if (user.role === "worker") {
    return redirect("/worker");
  }

  return redirect(UNAUTHORIZED_PATH);
}
