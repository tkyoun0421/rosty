import { OperationsDashboardCard } from "#flows/admin-operations-dashboard/components/OperationsDashboardCard";
import type { OperationsDashboardScheduleCard } from "#queries/operations-dashboard/types/operationsDashboard";

interface AdminOperationsDashboardSectionProps {
  title: "Today" | "Upcoming";
  schedules: OperationsDashboardScheduleCard[];
}

export function AdminOperationsDashboardSection({
  title,
  schedules,
}: AdminOperationsDashboardSectionProps) {
  return (
    <section aria-labelledby={`operations-dashboard-${title.toLowerCase()}`} className="grid gap-6">
      <div className="grid gap-1">
        <h2 id={`operations-dashboard-${title.toLowerCase()}`} className="text-xl font-semibold">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">
          {title === "Today"
            ? "Focus on the schedules that need immediate staffing or attendance attention."
            : "Preview the next schedules that may need follow-up soon."}
        </p>
      </div>
      {schedules.length > 0 ? (
        <div className="grid gap-6">
          {schedules.map((schedule) => (
            <OperationsDashboardCard key={schedule.scheduleId} card={schedule} />
          ))}
        </div>
      ) : null}
    </section>
  );
}