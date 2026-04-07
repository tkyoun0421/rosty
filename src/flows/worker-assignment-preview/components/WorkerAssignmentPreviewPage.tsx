import Link from "next/link";

import { AttendanceCheckInCard } from "#mutations/attendance/components/AttendanceCheckInCard";
import { PayPreviewTotalCard } from "#flows/worker-assignment-preview/components/PayPreviewTotalCard";
import {
  formatScheduleWindow,
  getAssignmentBreakdown,
} from "#flows/worker-assignment-preview/utils/workerAssignmentPreview";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { listConfirmedWorkerAssignments } from "#queries/assignment/dal/listConfirmedWorkerAssignments";
import { listWorkerAttendanceStatuses } from "#queries/attendance/dal/listWorkerAttendanceStatuses";
import { Alert, AlertDescription, AlertTitle } from "#shared/ui/alert";
import { Badge } from "#shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#shared/ui/card";

export async function WorkerAssignmentPreviewPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return (
      <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-3xl">
          <Card className="bg-background">
            <CardHeader>
              <CardTitle>Worker access is required.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-sm text-muted-foreground">
                Sign in with a worker account to review confirmed shifts, expected pay, and
                check-in status.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const [assignments, attendanceStatuses] = await Promise.all([
    listConfirmedWorkerAssignments(currentUser.id),
    listWorkerAttendanceStatuses(currentUser.id),
  ]);
  const attendanceStatusByAssignmentId = new Map(
    attendanceStatuses.map((attendanceStatus) => [attendanceStatus.assignmentId, attendanceStatus]),
  );
  const hasPendingPay = assignments.some((assignment) => assignment.payStatus === "missing_worker_rate");
  const readyAssignments = assignments.filter((assignment) => assignment.payStatus === "ready");
  const totalPayCents = readyAssignments.reduce(
    (sum, assignment) => sum + (assignment.totalPayCents ?? 0),
    0,
  );
  const pendingRateCount = assignments.length - readyAssignments.length;

  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)] lg:items-start">
        <section className="grid gap-8">
          <header className="grid gap-3">
            <Badge variant="outline" className="w-fit">
              Confirmed work
            </Badge>
            <h1 className="text-[28px] font-semibold leading-tight">Confirmed shifts</h1>
            <p className="max-w-2xl text-base text-muted-foreground">
              Review your confirmed roles, expected pay, and check-in status before arriving on
              site.
            </p>
          </header>

          {assignments.length === 0 ? (
            <Card aria-label="Empty confirmed assignments" className="bg-background">
              <CardHeader>
                <CardTitle>No confirmed shift yet</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="m-0 text-base text-muted-foreground">
                  When an admin finalizes your role, it will appear here with pay and check-in
                  details.
                </p>
                <Link
                  className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  href="/worker/schedules"
                >
                  Browse recruiting schedules
                </Link>
              </CardContent>
            </Card>
          ) : (
            <section aria-label="Confirmed assignments" className="grid gap-6">
              {hasPendingPay ? (
                <Card className="bg-background">
                  <CardHeader>
                    <CardTitle>Pay details are not ready yet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="m-0 text-base text-muted-foreground">
                      Your shift is confirmed, but your hourly rate is still being assigned. Contact
                      an admin if this stays unresolved.
                    </p>
                  </CardContent>
                </Card>
              ) : null}

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
                          <CardDescription>
                            {formatScheduleWindow(assignment.startsAt, assignment.endsAt)}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            assignment.payStatus === "missing_worker_rate"
                              ? "outline"
                              : assignment.overtimeApplied
                                ? "default"
                                : "secondary"
                          }
                        >
                          {assignment.payStatus === "missing_worker_rate"
                            ? "Rate pending"
                            : assignment.overtimeApplied
                              ? "Overtime included"
                              : "Regular hours only"}
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
            hasPendingPay={hasPendingPay}
            totalPayCents={totalPayCents}
          />
          <Card aria-label="Confirmed work snapshot">
            <CardHeader>
              <CardTitle>Shift snapshot</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="m-0 text-sm font-semibold text-muted-foreground">Confirmed shifts</p>
                <p className="mt-2 text-base">{assignments.length}</p>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="m-0 text-sm font-semibold text-muted-foreground">Pay-ready shifts</p>
                <p className="mt-2 text-base">{readyAssignments.length}</p>
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <p className="m-0 text-sm font-semibold text-muted-foreground">Rate pending</p>
                <p className="mt-2 text-base">{pendingRateCount}</p>
              </div>
            </CardContent>
          </Card>
          {hasPendingPay ? (
            <Alert>
              <AlertTitle>Admin follow-up may be needed</AlertTitle>
              <AlertDescription>
                Confirmed work is still visible, and attendance remains available while pay details
                are being finalized.
              </AlertDescription>
            </Alert>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
