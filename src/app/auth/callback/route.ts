import { NextResponse } from "next/server";

import { finalizeAuthSession } from "#mutations/auth/actions/finalizeAuthSession";
import { SIGN_IN_PATH } from "#shared/config/authConfig";
import { getServerSupabaseClient } from "#shared/lib/supabase/serverClient";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const inviteToken = url.searchParams.get("invite_token");

  if (!code) {
    return NextResponse.redirect(new URL(`${SIGN_IN_PATH}?error=oauth`, url.origin));
  }

  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`${SIGN_IN_PATH}?error=oauth`, url.origin));
  }

  const nextPath = await finalizeAuthSession(inviteToken ?? undefined);

  return NextResponse.redirect(new URL(nextPath, url.origin));
}
