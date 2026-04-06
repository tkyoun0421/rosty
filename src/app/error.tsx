"use client";

import Link from "next/link";
import { useEffect } from "react";

import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";
import { ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";
import { Alert, AlertDescription, AlertTitle } from "#shared/ui/alert";
import { Button } from "#shared/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EntrySurfaceFrame
      badge="Something went wrong"
      title="We could not load this screen"
      description="Try the request again or return to a stable route."
    >
      <Alert variant="destructive">
        <AlertTitle>Route error</AlertTitle>
        <AlertDescription>
          {error.message || "An unexpected error interrupted this page."}
        </AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href={ROOT_PATH}>
          Return home
        </Link>
        <Link className="text-sm font-semibold text-primary underline-offset-4 hover:underline" href={SIGN_IN_PATH}>
          Go to sign in
        </Link>
      </div>
    </EntrySurfaceFrame>
  );
}
