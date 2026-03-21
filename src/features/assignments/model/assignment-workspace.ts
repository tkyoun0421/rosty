import type { AvailabilityCollectionState, RequiredGender, ScheduleStatus } from '@/features/schedules/model/schedules';

export type AssignmentWorkspaceResponseState =
  | 'available'
  | 'unavailable'
  | 'not_responded';

export type AssignmentWorkspaceCandidate = {
  userId: string;
  fullName: string;
  gender: 'male' | 'female' | 'unspecified';
  responseState: AssignmentWorkspaceResponseState;
  existingAssignmentCount: number;
  requiresException: boolean;
};

export type AssignmentWorkspaceSeat = {
  seatIndex: number;
  assignmentId: string | null;
  status: 'empty' | 'proposed' | 'confirmed' | 'cancel_requested' | 'cancelled' | 'completed';
  assigneeUserId: string | null;
  assigneeName: string | null;
  guestName: string | null;
  isExceptionCase: boolean;
};

export type AssignmentWorkspaceSlot = {
  slotId: string;
  positionName: string;
  headcount: number;
  requiredGender: RequiredGender;
  availableCandidates: AssignmentWorkspaceCandidate[];
  supportCandidates: AssignmentWorkspaceCandidate[];
  seats: AssignmentWorkspaceSeat[];
  vacancyCount: number;
};

export type AssignmentWorkspaceSnapshot = {
  scheduleId: string;
  title: string;
  eventDate: string;
  scheduleStatus: ScheduleStatus;
  collectionState: AvailabilityCollectionState;
  slots: AssignmentWorkspaceSlot[];
  missingRequiredSeatCount: number;
  canEdit: boolean;
  canConfirm: boolean;
};

type Input = {
  schedule: {
    id: string;
    title: string;
    eventDate: string;
    scheduleStatus: ScheduleStatus;
    collectionState: AvailabilityCollectionState;
  } | null;
  slots: {
    id: string;
    positionName: string;
    headcount: number;
    requiredGender: RequiredGender;
    isEnabled: boolean;
  }[];
  employees: {
    id: string;
    fullName: string;
    gender: 'male' | 'female' | 'unspecified';
  }[];
  submissions: {
    userId: string;
    status: 'available' | 'unavailable';
  }[];
  assignments: {
    id: string;
    slotId: string;
    status: 'proposed' | 'confirmed' | 'cancel_requested' | 'cancelled' | 'completed';
    assigneeUserId: string | null;
    assigneeName: string | null;
    guestName: string | null;
    isExceptionCase: boolean;
  }[];
};

function matchesGender(
  requiredGender: RequiredGender,
  profileGender: 'male' | 'female' | 'unspecified',
): boolean {
  return requiredGender === 'any' || requiredGender === profileGender;
}

function compareCandidates(
  left: AssignmentWorkspaceCandidate,
  right: AssignmentWorkspaceCandidate,
): number {
  const priority: Record<AssignmentWorkspaceResponseState, number> = {
    available: 3,
    unavailable: 2,
    not_responded: 1,
  };

  if (priority[left.responseState] !== priority[right.responseState]) {
    return priority[right.responseState] - priority[left.responseState];
  }

  return left.fullName.localeCompare(right.fullName);
}

export function createAssignmentWorkspaceSnapshot(
  input: Input,
): AssignmentWorkspaceSnapshot | null {
  if (!input.schedule) {
    return null;
  }

  const employeeById = new Map(
    input.employees.map((employee) => [employee.id, employee]),
  );
  const submissionsByUserId = new Map(
    input.submissions.map((submission) => [submission.userId, submission.status]),
  );
  const assignmentCountByUserId = new Map<string, number>();

  for (const assignment of input.assignments) {
    if (!assignment.assigneeUserId) {
      continue;
    }

    assignmentCountByUserId.set(
      assignment.assigneeUserId,
      (assignmentCountByUserId.get(assignment.assigneeUserId) ?? 0) + 1,
    );
  }

  const slots = input.slots
    .filter((slot) => slot.isEnabled)
    .map((slot) => {
      const slotAssignments = input.assignments
        .filter((assignment) => assignment.slotId === slot.id)
        .sort((left, right) => left.id.localeCompare(right.id));

      const seats: AssignmentWorkspaceSeat[] = [];

      for (let index = 0; index < Math.max(slot.headcount, slotAssignments.length); index += 1) {
        const assignment = slotAssignments[index] ?? null;

        seats.push({
          seatIndex: index,
          assignmentId: assignment?.id ?? null,
          status: assignment?.status ?? 'empty',
          assigneeUserId: assignment?.assigneeUserId ?? null,
          assigneeName: assignment?.assigneeUserId
            ? employeeById.get(assignment.assigneeUserId)?.fullName ?? assignment.assigneeName
            : assignment?.assigneeName ?? null,
          guestName: assignment?.guestName ?? null,
          isExceptionCase: assignment?.isExceptionCase ?? false,
        });
      }

      const matchingEmployees = input.employees.filter((employee) =>
        matchesGender(slot.requiredGender, employee.gender),
      );

      const availableCandidates: AssignmentWorkspaceCandidate[] = [];
      const supportCandidates: AssignmentWorkspaceCandidate[] = [];

      for (const employee of matchingEmployees) {
        const responseState =
          submissionsByUserId.get(employee.id) ?? 'not_responded';
        const candidate: AssignmentWorkspaceCandidate = {
          userId: employee.id,
          fullName: employee.fullName,
          gender: employee.gender,
          responseState,
          existingAssignmentCount: assignmentCountByUserId.get(employee.id) ?? 0,
          requiresException:
            (assignmentCountByUserId.get(employee.id) ?? 0) > 0,
        };

        if (responseState === 'available') {
          availableCandidates.push(candidate);
        } else {
          supportCandidates.push(candidate);
        }
      }

      availableCandidates.sort(compareCandidates);
      supportCandidates.sort(compareCandidates);

      const filledSeatCount = seats.filter((seat) => seat.status !== 'empty').length;

      return {
        slotId: slot.id,
        positionName: slot.positionName,
        headcount: slot.headcount,
        requiredGender: slot.requiredGender,
        availableCandidates,
        supportCandidates,
        seats,
        vacancyCount: Math.max(0, slot.headcount - filledSeatCount),
      };
    })
    .sort((left, right) => left.positionName.localeCompare(right.positionName));

  return {
    scheduleId: input.schedule.id,
    title: input.schedule.title,
    eventDate: input.schedule.eventDate,
    scheduleStatus: input.schedule.scheduleStatus,
    collectionState: input.schedule.collectionState,
    slots,
    missingRequiredSeatCount: slots.reduce((total, slot) => total + slot.vacancyCount, 0),
    canEdit: input.schedule.scheduleStatus === 'collecting',
    canConfirm: input.schedule.scheduleStatus === 'collecting',
  };
}
