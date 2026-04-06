"use client";

import { useTransition } from "react";

import { startGoogleSignIn } from "#mutations/auth/actions/startGoogleSignIn";
import { Button } from "#shared/ui/button";

type GoogleSignInButtonProps = {
  inviteToken?: string;
  label: string;
};

export function GoogleSignInButton({ inviteToken, label }: GoogleSignInButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await startGoogleSignIn(window.location.origin, inviteToken);
        });
      }}
    >
      {isPending ? "Connecting to Google..." : label}
    </Button>
  );
}
