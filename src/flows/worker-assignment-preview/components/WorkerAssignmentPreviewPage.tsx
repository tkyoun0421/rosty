import { getCurrentUser } from "#queries/access/dal/getCurrentUser";
import { listConfirmedWorkerAssignments } from "#queries/assignment/dal/listConfirmedWorkerAssignments";

import { ConfirmedAssignmentList } from "#flows/worker-assignment-preview/components/ConfirmedAssignmentList";
import { PayPreviewTotalCard } from "#flows/worker-assignment-preview/components/PayPreviewTotalCard";

export async function WorkerAssignmentPreviewPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return <main>Worker access required.</main>;
  }

  const assignments = await listConfirmedWorkerAssignments(currentUser.id);
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
        <ConfirmedAssignmentList assignments={assignments} />
      )}
    </main>
  );
}
