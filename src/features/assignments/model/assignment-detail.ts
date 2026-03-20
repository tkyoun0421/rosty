import type { MyAssignmentStatus } from '@/features/assignments/model/my-assignments';

export type CancellationRequestState = 'requested' | 'approved' | 'rejected';

export type AssignmentDetailSource = {
  schedule: {
    id: string;
    eventDate: string;
    memo: string | null;
    packageCount: number;
  } | null;
  positions: {
    assignmentId: string;
    slotId: string;
    positionName: string;
    status: MyAssignmentStatus;
    cancellationRequest: {
      status: CancellationRequestState;
      reason: string;
    } | null;
  }[];
};

export type AssignmentDetailSnapshot = {
  scheduleId: string;
  title: string;
  eventDate: string;
  positions: {
    assignmentId: string;
    positionName: string;
    status: MyAssignmentStatus;
    cancellationRequest: {
      status: CancellationRequestState;
      reason: string;
    } | null;
    canRequestCancellation: boolean;
  }[];
};

function buildScheduleTitle(schedule: {
  eventDate: string;
  memo: string | null;
  packageCount: number;
}): string {
  const packageLabel = `${schedule.packageCount} packages`;

  return schedule.memo && schedule.memo.trim().length > 0
    ? `${schedule.eventDate} · ${schedule.memo.trim()}`
    : `${schedule.eventDate} · ${packageLabel}`;
}

export function canRequestCancellation(
  status: MyAssignmentStatus,
  eventDate: string,
  today: string,
): boolean {
  return status === 'confirmed' && eventDate >= today;
}

export function createAssignmentDetailSnapshot(
  source: AssignmentDetailSource,
  scheduleId: string,
  today: string,
): AssignmentDetailSnapshot | null {
  if (!source.schedule) {
    return null;
  }

  return {
    scheduleId,
    title: buildScheduleTitle(source.schedule),
    eventDate: source.schedule.eventDate,
    positions: source.positions
      .map((position) => ({
        assignmentId: position.assignmentId,
        positionName: position.positionName,
        status: position.status,
        cancellationRequest: position.cancellationRequest,
        canRequestCancellation: canRequestCancellation(
          position.status,
          source.schedule!.eventDate,
          today,
        ),
      }))
      .sort((left, right) => left.positionName.localeCompare(right.positionName)),
  };
}

export function formatCancellationRequestStatus(
  status: CancellationRequestState,
): string {
  switch (status) {
    case 'requested':
      return 'Requested';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
  }
}
