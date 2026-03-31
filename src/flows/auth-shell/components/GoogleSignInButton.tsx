"use client";

import { startTransition } from "react";

import { startGoogleSignIn } from "#mutations/auth/actions/startGoogleSignIn";

type GoogleSignInButtonProps = {
  inviteToken?: string;
  label: string;
};

export function GoogleSignInButton({ inviteToken, label }: GoogleSignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await startGoogleSignIn(window.location.origin, inviteToken);
        });
      }}
    >
      {label}
    </button>
  );
}
