import { NextRequest, NextResponse } from "next/server";

import { APP_ROUTES } from "#shared/constants/routes";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL(APP_ROUTES.signIn, request.url));
  response.cookies.delete("rosty-role");
  return response;
}
