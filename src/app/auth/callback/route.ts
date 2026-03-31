import { NextResponse } from "next/server";

import { acceptInvite } from "#mutations/invite/actions/acceptInvite";
import { ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";
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

  if (inviteToken) {
    await acceptInvite(inviteToken);
  }

  return NextResponse.redirect(new URL(ROOT_PATH, url.origin));
}

