export type ScheduleStatus = 'collecting' | 'assigned' | 'completed' | 'cancelled';
export type AvailabilityCollectionState = 'open' | 'locked';
export type RequiredGender = 'any' | 'male' | 'female';

export type ScheduleListItem = {
  id: string;
  title: string;
  eventDate: string;
  packageCount: number;
  status: ScheduleStatus;
  collectionState: AvailabilityCollectionState;
  enabledSlotCount: number;
};

export type ScheduleSlotSummary = {
  id: string;
  positionName: string;
  headcount: number;
  requiredGender: RequiredGender;
  isEnabled: boolean;
};

export type ScheduleDetail = ScheduleListItem & {
  memo: string | null;
  slots: ScheduleSlotSummary[];
};

export function buildScheduleTitle(input: {
  eventDate: string;
  memo: string | null;
  packageCount: number;
}): string {
  const packageLabel = `${input.packageCount} packages`;

  return input.memo && input.memo.trim().length > 0
    ? `${input.eventDate} · ${input.memo.trim()}`
    : `${input.eventDate} · ${packageLabel}`;
}

export function formatScheduleStatus(status: ScheduleStatus): string {
  switch (status) {
    case 'collecting':
      return 'Collecting';
    case 'assigned':
      return 'Assigned';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
  }
}

export function formatCollectionState(
  state: AvailabilityCollectionState,
): string {
  return state === 'open' ? 'Open' : 'Locked';
}
