export type GlobalSearchScheduleResult = {
  id: string;
  title: string;
  eventDate: string;
};

export type GlobalSearchAssignmentResult = {
  scheduleId: string;
  title: string;
  positions: string[];
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
