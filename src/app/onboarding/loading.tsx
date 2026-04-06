import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";

export default function OnboardingLoading() {
  return (
    <EntrySurfaceFrame
      badge="Loading"
      title="Preparing profile setup"
      description="We are loading your onboarding details now."
    >
      <div className="h-2 w-full rounded-full bg-secondary">
        <div className="h-2 w-2/5 animate-pulse rounded-full bg-primary" />
      </div>
    </EntrySurfaceFrame>
  );
}
