import Link from "next/link";

import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";
import { ROOT_PATH, SIGN_IN_PATH } from "#shared/config/authConfig";
import { Alert, AlertDescription, AlertTitle } from "#shared/ui/alert";

export default function UnauthorizedPage() {
  return (
    <EntrySurfaceFrame
      badge="Access required"
      title="You do not have access to this area"
      description="Use an invited account with the correct role, or return to a route you can access."
    >
      <Alert variant="destructive">
        <AlertTitle>Access blocked</AlertTitle>
        <AlertDescription>
          This route is limited to invited users with the required workspace role.
        </AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-4 text-sm font-semibold">
        <Link className="text-primary underline-offset-4 hover:underline" href={ROOT_PATH}>
          Return home
        </Link>
        <Link className="text-primary underline-offset-4 hover:underline" href={SIGN_IN_PATH}>
          Go to sign in
        </Link>
      </div>
    </EntrySurfaceFrame>
  );
}
