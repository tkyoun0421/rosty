import type { WorkerAssignmentPreview } from "#queries/assignment/types/workerAssignmentPreview";

interface ConfirmedAssignmentListProps {
  assignments: WorkerAssignmentPreview[];
}

export function ConfirmedAssignmentList({
  assignments,
}: ConfirmedAssignmentListProps) {
  return (
    <section aria-label="Confirmed assignments">
      <h2>Confirmed assignments</h2>
      <ul>
        {assignments.map((assignment) => (
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
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
