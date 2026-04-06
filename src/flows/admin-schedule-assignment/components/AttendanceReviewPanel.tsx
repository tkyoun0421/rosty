import type { AdminScheduleAttendanceDetail } from "#queries/attendance/types/adminScheduleAttendanceDetail";
import {
  attendanceStatusLabels,
  formatAttendanceTime,
  getAttendanceSummaryCards,
} from "#flows/admin-schedule-assignment/utils/attendanceReview";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

interface AttendanceReviewPanelProps {
  detail: AdminScheduleAttendanceDetail;
}

export function AttendanceReviewPanel({ detail }: AttendanceReviewPanelProps) {
  return (
    <Card aria-label="Attendance review" className="bg-background">
      <CardHeader className="gap-6">
        <div className="grid gap-2">
          <CardTitle>Attendance review</CardTitle>
          <p className="m-0 text-[28px] font-semibold leading-tight">
            {detail.summary.checkedInCount + detail.summary.lateCount} of{" "}
            {detail.summary.confirmedWorkerCount} confirmed workers checked in
          </p>
          <p className="m-0 text-base text-muted-foreground">
            Review check-in status before changing assignments or publishing the final staffing
            plan. Attendance opened at {formatAttendanceTime(detail.schedule.opensAt)}.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {getAttendanceSummaryCards(detail).map((card) => (
            <Card key={card.label} className="border-dashed bg-secondary/30 shadow-none">
              <CardContent className="grid gap-2 px-4 py-4">
                <p className="m-0 text-sm font-semibold text-muted-foreground">{card.label}</p>
                <p className="m-0 text-2xl font-semibold leading-none">{card.value}</p>
                <p className="m-0 text-sm text-muted-foreground">{card.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {detail.workers.map((worker) => (
          <article
            key={worker.scheduleAssignmentId}
            className="grid gap-3 rounded-2xl border border-border bg-secondary/30 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-1">
                <strong className="text-base font-semibold">{worker.workerName ?? worker.workerUserId}</strong>
                <span className="text-sm text-muted-foreground">{worker.roleCode ?? "Unassigned role"}</span>
              </div>
              <Badge
                variant={
                  worker.status === "late"
                    ? "destructive"
                    : worker.status === "checked_in"
                      ? "default"
                      : "secondary"
                }
              >
                {attendanceStatusLabels[worker.status]}
              </Badge>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p className="m-0">Check-in time: {formatAttendanceTime(worker.checkedInAt)}</p>
              <p className="m-0">Worker ID: {worker.workerUserId}</p>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
