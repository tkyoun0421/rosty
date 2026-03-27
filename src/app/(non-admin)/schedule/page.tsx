import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { EmployeeSchedulePage } from "#flows/employee-schedule/components/EmployeeSchedulePage.server";
import { APP_ROUTES } from "#shared/constants/routes";
import { readRoleFromCookieValue } from "#shared/lib/authSession";

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const role = readRoleFromCookieValue(cookieStore.get("rosty-role")?.value);

  if (role !== "employee") {
    redirect(APP_ROUTES.signIn);
  }

  return <EmployeeSchedulePage />;
}
