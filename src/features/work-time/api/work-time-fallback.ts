import {
  assignmentRequestSeedSource,
  myAssignmentsSeedSource,
} from '@/features/assignments/api/assignment-read-fallback';
import { scheduleSeedRows } from '@/features/schedules/api/schedule-read-fallback';

let seededWorkTimeByScheduleId: Record<
  string,
  {
    planned_start_at: string | null;
    planned_end_at: string | null;
    actual_start_at: string | null;
    actual_end_at: string | null;
    status: 'planned' | 'actual_recorded' | 'corrected';
    updated_at: string | null;
  }
> = {
  'schedule-1': {
    planned_start_at: '2026-03-22T01:00:00.000Z',
    planned_end_at: '2026-03-22T09:00:00.000Z',
    actual_start_at: null,
    actual_end_at: null,
    status: 'planned',
    updated_at: null,
  },
};

export function readSeedWorkTime(scheduleId: string) {
  return seededWorkTimeByScheduleId[scheduleId] ?? null;
}

export function saveSeedWorkTime(
  scheduleId: string,
  input: {
    planned_start_at: string | null;
    planned_end_at: string | null;
    actual_start_at: string | null;
    actual_end_at: string | null;
    status: 'planned' | 'actual_recorded' | 'corrected';
  },
) {
  seededWorkTimeByScheduleId = {
    ...seededWorkTimeByScheduleId,
    [scheduleId]: {
      ...input,
      updated_at: new Date().toISOString(),
    },
  };
}

export function completeSeedScheduleOperation(scheduleId: string) {
  const schedule = scheduleSeedRows.find((entry) => entry.id === scheduleId);

  if (!schedule) {
    throw new Error('The schedule was not found.');
  }

  if (schedule.status !== 'assigned') {
    throw new Error('Only assigned schedules can be completed.');
  }

  const record = seededWorkTimeByScheduleId[scheduleId];

  if (!record?.actual_start_at || !record.actual_end_at) {
    throw new Error('Record actual start and end times before completing the schedule.');
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
    throw new Error('Resolve pending cancellation requests before completing the schedule.');
  }

  schedule.status = 'completed';

  let completedAssignmentCount = 0;

  myAssignmentsSeedSource.assignments = myAssignmentsSeedSource.assignments.map(
    (assignment) => {
      if (
        assignment.scheduleId === scheduleId &&
        assignment.status === 'confirmed'
      ) {
        completedAssignmentCount += 1;
        return {
          ...assignment,
          status: 'completed',
        };
      }

      return assignment;
    },
  );

  return {
    schedule_id: scheduleId,
    schedule_status: 'completed' as const,
    completed_assignment_count: completedAssignmentCount,
  };
}
