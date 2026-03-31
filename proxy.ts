import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SIGN_IN_PATH, UNAUTHORIZED_PATH } from "#shared/config/authConfig";

function hasSupabaseSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = hasSupabaseSessionCookie(request);

  if ((pathname.startsWith("/admin") || pathname.startsWith("/worker")) && !hasSession) {
    return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
  }

  if (pathname === SIGN_IN_PATH && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === UNAUTHORIZED_PATH) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/worker/:path*", "/sign-in", "/unauthorized"],
};
