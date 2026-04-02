import { AttendanceCheckInCard } from "#mutations/attendance/components/AttendanceCheckInCard";
import { PayPreviewTotalCard } from "#flows/worker-assignment-preview/components/PayPreviewTotalCard";
import {
  formatCurrency,
  formatScheduleWindow,
  getAssignmentBreakdown,
} from "#flows/worker-assignment-preview/utils/workerAssignmentPreview";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { listConfirmedWorkerAssignments } from "#queries/assignment/dal/listConfirmedWorkerAssignments";
import { listWorkerAttendanceStatuses } from "#queries/attendance/dal/listWorkerAttendanceStatuses";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";

export async function WorkerAssignmentPreviewPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return <main>Worker access required.</main>;
  }

  const [assignments, attendanceStatuses] = await Promise.all([
    listConfirmedWorkerAssignments(currentUser.id),
    listWorkerAttendanceStatuses(currentUser.id),
  ]);
  const attendanceStatusByAssignmentId = new Map(
    attendanceStatuses.map((attendanceStatus) => [attendanceStatus.assignmentId, attendanceStatus]),
  );
  const totalPayCents = assignments.reduce((sum, assignment) => sum + assignment.totalPayCents, 0);
  const totalRegularHours = assignments.reduce((sum, assignment) => sum + assignment.regularHours, 0);
  const totalOvertimeHours = assignments.reduce((sum, assignment) => sum + assignment.overtimeHours, 0);

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)] lg:items-start">
        <section className="grid gap-8">
          <header className="grid gap-3">
            <Badge variant="outline" className="w-fit">
              Worker attendance
            </Badge>
            <h1 className="text-[28px] font-semibold leading-tight">Check-in status</h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Review your confirmed assignments, check whether the venue window is open, and submit
              attendance once when you arrive on site.
            </p>
          </header>

          {assignments.length === 0 ? (
            <Card aria-label="Empty confirmed assignments" className="bg-secondary/70">
              <CardHeader>
                <CardTitle>No confirmed shift ready for check-in</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="m-0 text-base text-muted-foreground">
                  Your confirmed assignment will appear here when check-in opens. If you already have
                  a shift, wait for the check-in window or contact an admin.
                </p>
              </CardContent>
            </Card>
          ) : (
            <section aria-label="Confirmed assignments" className="grid gap-6">
              {assignments.map((assignment) => {
                const attendanceStatus = attendanceStatusByAssignmentId.get(assignment.assignmentId);

                if (!attendanceStatus) {
                  return null;
                }

                return (
                  <Card key={assignment.assignmentId} className="overflow-hidden">
                    <CardHeader className="gap-3 border-b border-border/60 pb-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <CardTitle>{assignment.roleCode}</CardTitle>
                          <p className="m-0 text-base text-muted-foreground">
                            {formatScheduleWindow(assignment.startsAt, assignment.endsAt)}
                          </p>
                        </div>
                        <Badge variant={assignment.overtimeApplied ? "default" : "secondary"}>
                          {assignment.overtimeApplied ? "Overtime included" : "Regular hours only"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 pt-6">
                      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {getAssignmentBreakdown(assignment).map((item) => (
                          <div
                            key={`${assignment.assignmentId}-${item.label}`}
                            className="rounded-xl bg-secondary/60 p-4"
                          >
                            <dt className="text-sm font-semibold text-muted-foreground">{item.label}</dt>
                            <dd className="mt-2 text-base">{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                      <AttendanceCheckInCard
                        assignmentId={assignment.assignmentId}
                        roleCode={assignment.roleCode}
                        attendanceStatus={attendanceStatus}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          )}
        </section>

        <aside className="grid gap-6 lg:sticky lg:top-6">
          <PayPreviewTotalCard
            assignmentCount={assignments.length}
            totalPayCents={totalPayCents}
          />
          <Card aria-label="Calculation basis">
            <CardHeader>
              <CardTitle>Calculation basis</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="m-0 text-sm font-semibold text-muted-foreground">Confirmed assignments</p>
                <p className="mt-2 text-base">{assignments.length}</p>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="m-0 text-sm font-semibold text-muted-foreground">Regular hours</p>
                <p className="mt-2 text-base">{totalRegularHours}</p>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="m-0 text-sm font-semibold text-muted-foreground">Overtime hours</p>
                <p className="mt-2 text-base">{totalOvertimeHours}</p>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="m-0 text-sm font-semibold text-muted-foreground">Expected total</p>
                <p className="mt-2 text-base">{formatCurrency(totalPayCents)}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}