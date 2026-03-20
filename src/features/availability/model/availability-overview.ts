import type { AvailabilityCollectionState, RequiredGender, ScheduleStatus } from '@/features/schedules/model/schedules';

export type AvailabilityOverviewResponseState =
  | 'available'
  | 'unavailable'
  | 'not_responded';

export type AvailabilityOverviewCandidate = {
  userId: string;
  fullName: string;
  gender: 'male' | 'female' | 'unspecified';
  responseState: AvailabilityOverviewResponseState;
};

export type SlotAvailabilityOverview = {
  slotId: string;
  positionName: string;
  headcount: number;
  requiredGender: RequiredGender;
  availableCandidates: AvailabilityOverviewCandidate[];
  supportCandidates: AvailabilityOverviewCandidate[];
  vacancyCount: number;
};

export type AvailabilityOverviewSnapshot = {
  scheduleId: string;
  title: string;
  eventDate: string;
  scheduleStatus: ScheduleStatus;
  collectionState: AvailabilityCollectionState;
  slots: SlotAvailabilityOverview[];
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
};

function matchesGender(
  requiredGender: RequiredGender,
  profileGender: 'male' | 'female' | 'unspecified',
): boolean {
  return requiredGender === 'any' || requiredGender === profileGender;
}

function compareCandidates(
  left: AvailabilityOverviewCandidate,
  right: AvailabilityOverviewCandidate,
): number {
  const priority: Record<AvailabilityOverviewResponseState, number> = {
    available: 3,
    unavailable: 2,
    not_responded: 1,
  };

  if (priority[left.responseState] !== priority[right.responseState]) {
    return priority[right.responseState] - priority[left.responseState];
  }

  return left.fullName.localeCompare(right.fullName);
}

export function formatAvailabilityOverviewResponseState(
  state: AvailabilityOverviewResponseState,
): string {
  switch (state) {
    case 'available':
      return 'Available';
    case 'unavailable':
      return 'Unavailable';
    case 'not_responded':
      return 'No response';
  }
}

export function createAvailabilityOverviewSnapshot(
  input: Input,
): AvailabilityOverviewSnapshot | null {
  if (!input.schedule) {
    return null;
  }

  const submissionsByUserId = new Map(
    input.submissions.map((submission) => [submission.userId, submission.status]),
  );

  const slots = input.slots
    .filter((slot) => slot.isEnabled)
    .map((slot) => {
      const matchingEmployees = input.employees.filter((employee) =>
        matchesGender(slot.requiredGender, employee.gender),
      );

      const availableCandidates: AvailabilityOverviewCandidate[] = [];
      const supportCandidates: AvailabilityOverviewCandidate[] = [];

      for (const employee of matchingEmployees) {
        const responseState =
          submissionsByUserId.get(employee.id) ?? 'not_responded';
        const candidate: AvailabilityOverviewCandidate = {
          userId: employee.id,
          fullName: employee.fullName,
          gender: employee.gender,
          responseState,
        };

        if (responseState === 'available') {
          availableCandidates.push(candidate);
        } else {
          supportCandidates.push(candidate);
        }
      }

      availableCandidates.sort(compareCandidates);
      supportCandidates.sort(compareCandidates);

      return {
        slotId: slot.id,
        positionName: slot.positionName,
        headcount: slot.headcount,
        requiredGender: slot.requiredGender,
        availableCandidates,
        supportCandidates,
        vacancyCount: Math.max(0, slot.headcount - availableCandidates.length),
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
  };
}
