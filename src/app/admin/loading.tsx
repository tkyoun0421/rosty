import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";

export default function AdminLoading() {
  return (
    <EntrySurfaceFrame
      badge="Loading"
      title="Loading admin workspace"
      description="We are preparing schedules, operations, invites, and rate tools."
    >
      <div className="h-2 w-full rounded-full bg-secondary">
        <div className="h-2 w-2/5 animate-pulse rounded-full bg-primary" />
      </div>
    </EntrySurfaceFrame>
  );
}
