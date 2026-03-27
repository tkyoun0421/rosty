import { NextRequest, NextResponse } from "next/server";

import { APP_ROUTES } from "#shared/constants/routes";
import { isAppRole, resolveHomePathForRole } from "#shared/lib/authSession";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");

  if (!isAppRole(role)) {
    return NextResponse.redirect(new URL(APP_ROUTES.signIn, request.url));
  }

  const response = NextResponse.redirect(new URL(resolveHomePathForRole(role), request.url));
  response.cookies.set("rosty-role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}