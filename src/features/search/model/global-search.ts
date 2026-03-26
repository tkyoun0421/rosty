import type { MyAssignmentStatus } from '@/features/assignments/model/my-assignments';
import type {
  AvailabilityCollectionState,
  ScheduleStatus,
} from '@/features/schedules/model/schedules';

export type GlobalSearchScheduleResult = {
  id: string;
  title: string;
  eventDate: string;
  status: ScheduleStatus;
  collectionState: AvailabilityCollectionState;
};

export type GlobalSearchAssignmentResult = {
  scheduleId: string;
  title: string;
  eventDate: string;
  positions: string[];
  status: MyAssignmentStatus;
};

export type GlobalSearchMemberResult = {
  id: string;
  fullName: string;
  role: string;
  phoneNumber: string;
};

export type GlobalSearchSnapshot = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  schedules: GlobalSearchScheduleResult[];
  assignments: GlobalSearchAssignmentResult[];
  members: GlobalSearchMemberResult[];
};

export type GlobalSearchSectionChip =
  | 'all'
  | 'schedules'
  | 'assignments'
  | 'members';

function includesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function filterGlobalSearchResults<T>(
  items: T[],
  toSearchableText: (item: T) => string,
  query: string,
): T[] {
  const normalized = query.trim();

  if (normalized.length === 0) {
    return items;
  }

  return items.filter((item) => includesQuery(toSearchableText(item), normalized));
}

function getSearchScore(value: string, query: string): number {
  const normalizedValue = value.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  if (normalizedValue === normalizedQuery) {
    return 4;
  }

  if (normalizedValue.startsWith(normalizedQuery)) {
    return 3;
  }

  if (normalizedValue.includes(` ${normalizedQuery}`)) {
    return 2;
  }

  if (normalizedValue.includes(normalizedQuery)) {
    return 1;
  }

  return 0;
}

export function rankGlobalSearchResults<T>(
  items: T[],
  toPrimaryText: (item: T) => string,
  toSecondaryText: (item: T) => string,
  query: string,
): T[] {
  const normalized = query.trim();

  if (normalized.length === 0) {
    return items;
  }

  return items
    .map((item, index) => ({
      item,
      index,
      primaryScore: getSearchScore(toPrimaryText(item), normalized),
      secondaryScore: getSearchScore(toSecondaryText(item), normalized),
    }))
    .sort((left, right) => {
      if (right.primaryScore !== left.primaryScore) {
        return right.primaryScore - left.primaryScore;
      }

      if (right.secondaryScore !== left.secondaryScore) {
        return right.secondaryScore - left.secondaryScore;
      }

      return left.index - right.index;
    })
    .map((entry) => entry.item);
}

export function shouldShowGlobalSearchSection(
  chip: GlobalSearchSectionChip,
  section: Exclude<GlobalSearchSectionChip, 'all'>,
): boolean {
  return chip === 'all' || chip === section;
}
