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

export type ScheduleListTab = 'all' | 'collecting' | 'assigned' | 'closed';
export type ScheduleCollectionChip = 'all' | 'open' | 'locked';

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

export function filterScheduleListItems(input: {
  items: ScheduleListItem[];
  tab: ScheduleListTab;
  collection: ScheduleCollectionChip;
}): ScheduleListItem[] {
  return input.items.filter((item) => {
    const tabMatch =
      input.tab === 'all'
        ? true
        : input.tab === 'closed'
          ? item.status === 'completed' || item.status === 'cancelled'
          : item.status === input.tab;
    const collectionMatch =
      input.collection === 'all' || item.collectionState === input.collection;

    return tabMatch && collectionMatch;
  });
}

export function canCancelScheduleOperation(status: ScheduleStatus): boolean {
  return status === 'collecting' || status === 'assigned';
}
