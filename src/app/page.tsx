import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readRoleFromCookieValue, resolveHomePathForRole } from "#shared/lib/authSession";

export default async function HomePage() {
  const cookieStore = await cookies();
  const role = readRoleFromCookieValue(cookieStore.get("rosty-role")?.value);

  redirect(resolveHomePathForRole(role));
}
