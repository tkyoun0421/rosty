"use client";

import { startTransition } from "react";

import { startGoogleSignIn } from "#mutations/auth/actions/startGoogleSignIn";
import { hasBrowserSupabaseEnv } from "#shared/lib/supabase/browserClient";

type GoogleSignInButtonProps = {
  inviteToken?: string;
  label: string;
};

export function GoogleSignInButton({ inviteToken, label }: GoogleSignInButtonProps) {
  const canStartSignIn = hasBrowserSupabaseEnv();

  return (
    <>
      <button
        type="button"
        disabled={!canStartSignIn}
        onClick={() => {
          if (!canStartSignIn) {
            return;
          }

          startTransition(async () => {
            await startGoogleSignIn(window.location.origin, inviteToken);
          });
        }}
      >
        {label}
      </button>
      {!canStartSignIn ? <p>Supabase public env가 없어 로그인을 시작할 수 없습니다.</p> : null}
    </>
  );
}