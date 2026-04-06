import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";
import { GoogleSignInButton } from "#mutations/auth/components/GoogleSignInButton";

export default async function InviteTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <EntrySurfaceFrame
      badge="Invite"
      title="Accept your invite"
      description="Sign in with Google to accept your invite. After sign-in, you will finish profile setup before entering the workspace."
    >
      <GoogleSignInButton inviteToken={token} label="Accept invite with Google" />
      <p className="m-0 text-sm text-muted-foreground">
        Keep using the invited account so the invite stays attached to your profile.
      </p>
    </EntrySurfaceFrame>
  );
}
