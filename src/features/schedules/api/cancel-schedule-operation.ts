import { cancelWorkspaceSeedSchedule } from '@/features/assignments/api/assignment-workspace-fallback';
import {
  assignmentRequestSeedSource,
  myAssignmentsSeedSource,
} from '@/features/assignments/api/assignment-read-fallback';
import { scheduleSeedRows } from '@/features/schedules/api/schedule-read-fallback';
import { supabaseClient } from '@/shared/lib/supabase/client';

type CancelScheduleOperationRow = {
  schedule_id: string;
  schedule_status: 'cancelled';
  cancelled_assignment_count: number;
};

export async function cancelScheduleOperation(
  scheduleId: string,
): Promise<CancelScheduleOperationRow> {
  if (!supabaseClient) {
    return cancelSeedScheduleOperation(scheduleId);
  }

  const { data, error } = await supabaseClient
    .rpc('cancel_schedule_operation', {
      p_schedule_id: scheduleId,
    })
    .returns<CancelScheduleOperationRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The schedule could not be cancelled.');
  }

  return data;
}

function cancelSeedScheduleOperation(
  scheduleId: string,
): CancelScheduleOperationRow {
  const schedule = scheduleSeedRows.find((entry) => entry.id === scheduleId);

  if (!schedule) {
    throw new Error('The schedule was not found.');
  }

  if (!canCancelSeedSchedule(schedule.status)) {
    throw new Error('Only collecting or assigned schedules can be cancelled.');
  }

  const hasPendingCancellationRequest = assignmentRequestSeedSource.some(
    (request) =>
      request.status === 'requested' &&
      myAssignmentsSeedSource.assignments.some(
        (assignment) =>
          assignment.id === request.assignmentId &&
          assignment.scheduleId === scheduleId,
      ),
  );

  if (hasPendingCancellationRequest) {
    throw new Error(
      'Resolve pending cancellation requests before cancelling the schedule.',
    );
  }

  schedule.status = 'cancelled';
  schedule.collection_state = 'locked';

  let cancelledAssignmentCount = 0;

  myAssignmentsSeedSource.assignments = myAssignmentsSeedSource.assignments.map(
    (assignment) => {
      if (
        assignment.scheduleId === scheduleId &&
        (assignment.status === 'confirmed' ||
          assignment.status === 'cancel_requested')
      ) {
        cancelledAssignmentCount += 1;
        return {
          ...assignment,
          status: 'cancelled',
        };
      }

      return assignment;
    },
  );

  cancelledAssignmentCount += cancelWorkspaceSeedSchedule(scheduleId);

  return {
    schedule_id: scheduleId,
    schedule_status: 'cancelled',
    cancelled_assignment_count: cancelledAssignmentCount,
  };
}

function canCancelSeedSchedule(status: typeof scheduleSeedRows[number]['status']) {
  return status === 'collecting' || status === 'assigned';
}
