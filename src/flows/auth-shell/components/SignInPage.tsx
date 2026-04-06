import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";
import { GoogleSignInButton } from "#mutations/auth/components/GoogleSignInButton";

export function SignInPage() {
  return (
    <EntrySurfaceFrame
      badge="Sign in"
      title="Continue with Google"
      description="Sign in with the Google account tied to your invite. After sign-in, you will finish profile setup before entering the workspace."
    >
      <GoogleSignInButton label="Continue with Google" />
      <p className="m-0 text-sm text-muted-foreground">
        Use the same Google account that received your invite.
      </p>
    </EntrySurfaceFrame>
  );
}
