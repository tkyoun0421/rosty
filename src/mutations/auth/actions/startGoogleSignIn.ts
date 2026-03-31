"use client";

import { AUTH_CALLBACK_PATH, ROOT_PATH } from "#shared/config/authConfig";
import { getBrowserSupabaseClient } from "#shared/lib/supabase/browserClient";

export async function startGoogleSignIn(origin: string, inviteToken?: string) {
  const supabase = getBrowserSupabaseClient();
  const callbackUrl = new URL(`${origin}${AUTH_CALLBACK_PATH}`);

  callbackUrl.searchParams.set("next", ROOT_PATH);

  if (inviteToken) {
    callbackUrl.searchParams.set("invite_token", inviteToken);
  }

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });
}

