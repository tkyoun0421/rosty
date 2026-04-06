import { EntrySurfaceFrame } from "#flows/auth-shell/components/EntrySurfaceFrame";

export default function WorkerLoading() {
  return (
    <EntrySurfaceFrame
      badge="Loading"
      title="Loading worker workspace"
      description="We are preparing your schedules and confirmed-work view."
    >
      <div className="h-2 w-full rounded-full bg-secondary">
        <div className="h-2 w-2/5 animate-pulse rounded-full bg-primary" />
      </div>
    </EntrySurfaceFrame>
  );
}
