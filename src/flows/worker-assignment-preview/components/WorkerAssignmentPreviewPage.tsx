import { AttendanceCheckInCard } from "#mutations/attendance/components/AttendanceCheckInCard";
import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { listConfirmedWorkerAssignments } from "#queries/assignment/dal/listConfirmedWorkerAssignments";
import { listWorkerAttendanceStatuses } from "#queries/attendance/dal/listWorkerAttendanceStatuses";

import { PayPreviewTotalCard } from "#flows/worker-assignment-preview/components/PayPreviewTotalCard";

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
    <main>
      <PayPreviewTotalCard
        assignmentCount={assignments.length}
        totalPayCents={totalPayCents}
      />

      <section aria-label="Calculation basis">
        <h2>Calculation basis</h2>
        <p>Confirmed assignments: {assignments.length}</p>
        <p>Regular hours: {totalRegularHours}</p>
        <p>Overtime hours: {totalOvertimeHours}</p>
      </section>

      {assignments.length === 0 ? (
        <section aria-label="Empty confirmed assignments">
          <h2>No confirmed work yet</h2>
          <p>
            Confirmed assignments and pay previews will appear here after an admin confirms
            them.
          </p>
        </section>
      ) : (
        <section aria-label="Confirmed assignments">
          <h2>Confirmed assignments</h2>
          <ul>
            {assignments.map((assignment) => {
              const attendanceStatus = attendanceStatusByAssignmentId.get(assignment.assignmentId);

              if (!attendanceStatus) {
                return null;
              }

              return (
                <li key={assignment.assignmentId}>
                  <article>
                    <h3>{assignment.roleCode}</h3>
                    <p>
                      Date/time: {assignment.startsAt.slice(0, 10)} {assignment.startsAt.slice(11, 16)} -{" "}
                      {assignment.endsAt.slice(11, 16)}
                    </p>
                    <p>Role: {assignment.roleCode}</p>
                    <p>Hourly rate: {assignment.hourlyRateCents.toLocaleString()} KRW</p>
                    <p>Overtime applied: {assignment.overtimeApplied ? "Yes" : "No"}</p>
                    <AttendanceCheckInCard
                      assignmentId={assignment.assignmentId}
                      roleCode={assignment.roleCode}
                      attendanceStatus={attendanceStatus}
                    />
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}