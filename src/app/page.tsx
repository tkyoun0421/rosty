import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { EmployeeHome } from "#flows/employee-home/components/EmployeeHome.server";
import { readRoleFromCookieValue, resolveHomePathForRole } from "#shared/lib/authSession";

export default async function HomePage() {
  const cookieStore = await cookies();
  const role = readRoleFromCookieValue(cookieStore.get("rosty-role")?.value);

  if (role === "employee") {
    return <EmployeeHome />;
  }

  redirect(resolveHomePathForRole(role));
}