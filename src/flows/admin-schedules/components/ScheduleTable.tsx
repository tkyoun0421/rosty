import Link from "next/link";

import { ScheduleStatusForm } from "#flows/admin-schedules/components/ScheduleStatusForm";
import {
  formatRoleSlotSummary,
  formatScheduleStaffingSummary,
  formatScheduleWindow,
  scheduleStatusLabels,
} from "#flows/admin-schedules/utils/formatSchedule";
import type { AdminScheduleListItem } from "#queries/schedule/types/scheduleList";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

interface ScheduleTableProps {
  schedules: AdminScheduleListItem[];
}

function getStatusVariant(status: AdminScheduleListItem["status"]) {
  if (status === "assigning") {
    return "secondary" as const;
  }

  if (status === "confirmed") {
    return "outline" as const;
  }

  return "default" as const;
}

export function ScheduleTable({ schedules }: ScheduleTableProps) {
  if (schedules.length === 0) {
    return (
      <Card className="bg-background">
        <CardHeader>
          <CardTitle>No schedules created yet.</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-muted-foreground">
            Save the first schedule above to start recruiting workers and reviewing staffing status.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {schedules.map((schedule) => (
        <article key={schedule.id}>
          <Card className="bg-background">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-2">
                  <Badge variant={getStatusVariant(schedule.status)} className="w-fit">
                    {scheduleStatusLabels[schedule.status]}
                  </Badge>
                  <CardTitle className="text-lg">{formatScheduleWindow(schedule.startsAt, schedule.endsAt)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatScheduleStaffingSummary(schedule)}
                  </p>
                </div>
                <Link
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  href={`/admin/schedules/${schedule.id}`}
                >
                  Open assignment detail
                </Link>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 border-t border-border/60 pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div className="grid gap-2">
                <p className="text-sm font-medium text-foreground">Role summary</p>
                <p className="text-sm text-muted-foreground">{formatRoleSlotSummary(schedule)}</p>
              </div>
              <ScheduleStatusForm scheduleId={schedule.id} currentStatus={schedule.status} />
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}
