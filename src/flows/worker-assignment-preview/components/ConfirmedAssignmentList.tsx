import type { WorkerAssignmentPreview } from "#queries/assignment/types/workerAssignmentPreview";

import {
  formatScheduleWindow,
  getAssignmentBreakdown,
} from "#flows/worker-assignment-preview/utils/workerAssignmentPreview";

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
              <p>Date/time: {formatScheduleWindow(assignment.startsAt, assignment.endsAt)}</p>
              <p>Pay status: {assignment.payStatus === "ready" ? "Ready" : "Pending admin rate"}</p>
              {getAssignmentBreakdown(assignment).map((item) => (
                <p key={`${assignment.assignmentId}-${item.label}`}>
                  {item.label}: {item.value}
                </p>
              ))}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
