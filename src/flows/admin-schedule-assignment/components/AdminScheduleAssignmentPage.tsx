import { notFound } from "next/navigation";

import { ApplicantAssignmentPanel } from "#flows/admin-schedule-assignment/components/ApplicantAssignmentPanel";
import { AttendanceReviewPanel } from "#flows/admin-schedule-assignment/components/AttendanceReviewPanel";
import { scheduleStatusLabels } from "#flows/admin-schedules/utils/formatSchedule";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { getAdminScheduleAssignmentDetail } from "#queries/assignment/dal/getAdminScheduleAssignmentDetail";
import { getAdminScheduleAttendanceDetail } from "#queries/attendance/dal/getAdminScheduleAttendanceDetail";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

interface AdminScheduleAssignmentPageProps {
  scheduleId: string;
}

const scheduleWindowFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Seoul",
});

function formatScheduleWindow(startsAt: string, endsAt: string) {
  return `${scheduleWindowFormatter.format(new Date(startsAt))} to ${scheduleWindowFormatter.format(new Date(endsAt))}`;
}

export async function AdminScheduleAssignmentPage({
  scheduleId,
}: AdminScheduleAssignmentPageProps) {
  try {
    await requireAdminUser();
  } catch {
    return <main>Admin access required.</main>;
  }

  const [assignmentDetail, attendanceDetail] = await Promise.all([
    getAdminScheduleAssignmentDetail(scheduleId),
    getAdminScheduleAttendanceDetail(scheduleId),
  ]);

  if (!assignmentDetail || !attendanceDetail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8">
        <header className="grid gap-4">
          <div className="grid gap-3">
            <Badge variant="outline" className="w-fit">
              Schedule detail
            </Badge>
            <div className="grid gap-2">
              <h1 className="text-[28px] font-semibold leading-tight">Schedule assignment detail</h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Review staffing coverage and attendance before publishing final worker assignments.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-background">
              <CardHeader className="gap-1">
                <p className="text-sm font-semibold text-muted-foreground">Schedule window</p>
                <CardTitle className="text-lg">
                  {formatScheduleWindow(assignmentDetail.schedule.startsAt, assignmentDetail.schedule.endsAt)}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-background">
              <CardHeader className="gap-1">
                <p className="text-sm font-semibold text-muted-foreground">Current status</p>
                <CardTitle className="text-lg">
                  {scheduleStatusLabels[assignmentDetail.schedule.status]}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-background">
              <CardHeader className="gap-1">
                <p className="text-sm font-semibold text-muted-foreground">Confirmed workers</p>
                <CardTitle className="text-lg">
                  {attendanceDetail.summary.confirmedWorkerCount} workers in attendance scope
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </header>

        <AttendanceReviewPanel detail={attendanceDetail} />
        <ApplicantAssignmentPanel detail={assignmentDetail} />
      </div>
    </main>
  );
}
