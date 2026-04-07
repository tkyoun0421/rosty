import Link from "next/link";

import { ApplyToScheduleButton } from "#mutations/application/components/ApplyToScheduleButton";
import type { RecruitingScheduleListItem } from "#queries/schedule/dal/listRecruitingSchedules";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#shared/ui/card";

import {
  formatRoleSlotSummary,
  formatScheduleWindow,
} from "#flows/worker-schedules/utils/formatSchedule";

export interface WorkerScheduleListItem extends RecruitingScheduleListItem {
  applied: boolean;
}

interface WorkerScheduleListProps {
  schedules: WorkerScheduleListItem[];
}

export function WorkerScheduleList({ schedules }: WorkerScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <Card aria-label="Recruiting schedules empty state" className="bg-background">
        <CardHeader>
          <CardTitle>No recruiting schedule is open right now</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="m-0 text-base text-muted-foreground">
            Check back later or open confirmed work to review assignments that are already
            finalized.
          </p>
          <Link
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            href="/worker/assignments"
          >
            Review confirmed work
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <section aria-label="Recruiting schedules" className="grid gap-4">
      <ul className="grid gap-4">
        {schedules.map((schedule) => (
          <li key={schedule.id}>
            <Card className="overflow-hidden">
              <CardHeader className="gap-3 border-b border-border/60 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {formatScheduleWindow(schedule.startsAt, schedule.endsAt)}
                    </CardTitle>
                    <CardDescription>
                      Review the active opening, then submit your application from this card.
                    </CardDescription>
                  </div>
                  <Badge>Recruiting</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 pt-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-muted-foreground">Open roles</p>
                  <p className="m-0 text-base">
                    {schedule.roleSlotSummary.length > 0
                      ? formatRoleSlotSummary(schedule.roleSlotSummary)
                      : "Role details pending"}
                  </p>
                </div>
                <div className="sm:justify-self-end">
                  <ApplyToScheduleButton scheduleId={schedule.id} applied={schedule.applied} />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
