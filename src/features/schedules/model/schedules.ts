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
export type ScheduleDateChip = 'all' | 'next_7_days' | 'later' | 'past';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string): number {
  return Date.parse(`${value}T00:00:00.000Z`);
}

function resolveTodayDate(today?: string): string {
  return today ?? new Date().toISOString().slice(0, 10);
}

function matchesScheduleDateRange(input: {
  eventDate: string;
  dateRange: ScheduleDateChip;
  today?: string;
}): boolean {
  if (input.dateRange === 'all') {
    return true;
  }

  const diffInDays = Math.floor(
    (parseDateOnly(input.eventDate) - parseDateOnly(resolveTodayDate(input.today))) /
      DAY_IN_MS,
  );

  switch (input.dateRange) {
    case 'next_7_days':
      return diffInDays >= 0 && diffInDays <= 7;
    case 'later':
      return diffInDays > 7;
    case 'past':
      return diffInDays < 0;
  }
}

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
  dateRange?: ScheduleDateChip;
  query?: string;
  today?: string;
}): ScheduleListItem[] {
  const normalizedQuery = input.query?.trim().toLowerCase() ?? '';

  return input.items.filter((item) => {
    const tabMatch =
      input.tab === 'all'
        ? true
        : input.tab === 'closed'
          ? item.status === 'completed' || item.status === 'cancelled'
          : item.status === input.tab;
    const collectionMatch =
      input.collection === 'all' || item.collectionState === input.collection;
    const dateMatch = matchesScheduleDateRange({
      eventDate: item.eventDate,
      dateRange: input.dateRange ?? 'all',
      today: input.today,
    });
    const queryMatch =
      normalizedQuery.length === 0
        ? true
        : `${item.title} ${item.eventDate} ${formatScheduleStatus(item.status)} ${formatCollectionState(item.collectionState)}`
            .toLowerCase()
            .includes(normalizedQuery);

    return tabMatch && collectionMatch && dateMatch && queryMatch;
  });
}

export function canCancelScheduleOperation(status: ScheduleStatus): boolean {
  return status === 'collecting' || status === 'assigned';
}
