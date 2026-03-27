import { APP_ROUTES } from "#shared/constants/routes";

export type AppRole = "employee" | "admin";

export function isAppRole(value: string | null | undefined): value is AppRole {
  return value === "employee" || value === "admin";
}

export function resolveHomePathForRole(role: string | null | undefined): string {
  if (role === "employee") {
    return APP_ROUTES.employeeHome ?? "/";
  }

  if (role === "admin") {
    return APP_ROUTES.adminHome ?? "/admin";
  }

  return APP_ROUTES.signIn ?? "/sign-in";
}

export function readRoleFromCookieValue(value: string | null | undefined): AppRole | null {
  return isAppRole(value) ? value : null;
}