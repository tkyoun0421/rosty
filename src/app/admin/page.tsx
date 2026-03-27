import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AdminHome } from "#flows/admin-home/components/AdminHome.server";
import { APP_ROUTES } from "#shared/constants/routes";
import { readRoleFromCookieValue } from "#shared/lib/authSession";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const role = readRoleFromCookieValue(cookieStore.get("rosty-role")?.value);

  if (role !== "admin") {
    redirect(APP_ROUTES.signIn);
  }

  return <AdminHome />;
}