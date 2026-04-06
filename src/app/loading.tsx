import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";

export default function Loading() {
  return (
    <EntrySurfaceFrame
      badge="Loading"
      title="Loading your workspace..."
      description="Hold on while we prepare your next route."
    >
      <div className="h-2 w-full rounded-full bg-secondary">
        <div className="h-2 w-2/5 animate-pulse rounded-full bg-primary" />
      </div>
    </EntrySurfaceFrame>
  );
}
