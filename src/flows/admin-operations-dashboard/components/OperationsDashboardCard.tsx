import Link from "next/link";

import type { OperationsDashboardScheduleCard } from "#queries/operations-dashboard/types/operationsDashboard";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

const anomalyLabels = {
  unfilled_slots: "Unfilled slots",
  missing_check_ins: "Missing check-ins",
  late_arrivals: "Late arrivals",
  on_track: "On track",
} as const;

interface OperationsDashboardCardProps {
  card: OperationsDashboardScheduleCard;
}

export function OperationsDashboardCard({ card }: OperationsDashboardCardProps) {
  const anomalyLabel = anomalyLabels[card.topAnomaly.kind];
  const metrics = [
    { label: "Applicants", value: card.applicantCount },
    { label: "Confirmed", value: card.confirmedAssignmentCount },
    { label: "Checked in", value: card.checkedInCount },
    { label: "Late", value: card.lateCount },
  ];

  return (
    <article>
      <Card className="h-full bg-background">
        <CardHeader className="gap-4">
          <div>
            <Badge
              variant={card.topAnomaly.kind === "on_track" ? "secondary" : "default"}
              className="w-fit"
            >
              {anomalyLabel}
            </Badge>
          </div>
          <div className="grid gap-2">
            <CardTitle>{card.title}</CardTitle>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{card.dateLabel}</span>
              <span>Starts at {card.startTimeLabel}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl bg-secondary px-4 py-3">
                <dt className="text-sm font-semibold text-muted-foreground">{metric.label}</dt>
                <dd className="text-2xl font-semibold">{metric.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3">
            <div className="grid gap-1">
              <p className="text-sm font-semibold">Staffing and attendance summary</p>
              <p className="text-sm text-muted-foreground">
                {card.confirmedAssignmentCount} confirmed for {card.totalHeadcount} planned spots.
              </p>
            </div>
            <Link
              href={card.detailHref}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Review schedule
            </Link>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}