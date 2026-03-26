import { useQuery } from '@tanstack/react-query';

import { fetchMyAssignmentsSnapshot } from '@/features/assignments/api/fetch-my-assignments';
import { fetchScheduleList } from '@/features/schedules/api/fetch-schedule-list';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';
import type { AuthSession } from '@/features/auth/model/auth-types';
import type {
  GlobalSearchMemberResult,
  GlobalSearchSnapshot,
} from '@/features/search/model/global-search';

type MemberDirectoryRow = {
  id: string;
  full_name: string;
  phone_number: string;
  role: 'employee' | 'manager' | 'admin';
};

const seededMembers: GlobalSearchMemberResult[] = [
  {
    id: 'employee-1',
    fullName: 'Mina Staff',
    role: 'employee',
    phoneNumber: '01012345678',
  },
  {
    id: 'manager-1',
    fullName: 'Joon Manager',
    role: 'manager',
    phoneNumber: '01055557777',
  },
];

export function globalSearchQueryKey(userId: string, query: string) {
  return ['global-search', userId, query] as const;
}

async function fetchMemberResults(
  session: AuthSession,
  query: string,
): Promise<{
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  items: GlobalSearchMemberResult[];
}> {
  if (session.role === 'employee') {
    return {
      source: 'supabase',
      sourceMessage: null,
      items: [],
    };
  }

  if (!hasSupabaseConfig || !supabaseClient) {
    return {
      source: 'seed',
      sourceMessage:
        'Supabase config is missing, so member search is using the local seeded snapshot.',
      items: seededMembers.filter((member) =>
        member.fullName.toLowerCase().includes(query.toLowerCase()),
      ),
    };
  }

  const { data, error } = await supabaseClient
    .rpc('search_member_directory', {
      p_query: query,
    })
    .returns<MemberDirectoryRow[]>();

  if (error) {
    return {
      source: 'seed',
      sourceMessage: error.message,
      items: seededMembers.filter((member) =>
        member.fullName.toLowerCase().includes(query.toLowerCase()),
      ),
    };
  }

  const rows = Array.isArray(data) ? data : [];

  return {
    source: 'supabase',
    sourceMessage: null,
    items: rows.map((member: MemberDirectoryRow) => ({
      id: member.id,
      fullName: member.full_name,
      role: member.role,
      phoneNumber: member.phone_number,
    })),
  };
}

export async function fetchGlobalSearch(
  session: AuthSession,
  query: string,
): Promise<GlobalSearchSnapshot> {
  const [schedules, assignments, members] = await Promise.all([
    fetchScheduleList(),
    fetchMyAssignmentsSnapshot(session.userId),
    fetchMemberResults(session, query),
  ]);

  return {
    source:
      schedules.source === 'supabase' &&
      assignments.source === 'supabase' &&
      members.source === 'supabase'
        ? 'supabase'
        : 'seed',
    sourceMessage:
      schedules.sourceMessage ??
      assignments.sourceMessage ??
      members.sourceMessage,
    schedules: schedules.items.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      eventDate: schedule.eventDate,
      status: schedule.status,
      collectionState: schedule.collectionState,
    })),
    assignments: [...assignments.upcoming, ...assignments.past].map((assignment) => ({
      scheduleId: assignment.scheduleId,
      title: assignment.title,
      eventDate: assignment.eventDate,
      positions: assignment.positions,
      status: assignment.status,
    })),
    members: members.items,
  };
}

export function useGlobalSearchQuery(
  session: AuthSession | null,
  query: string,
) {
  return useQuery({
    queryKey:
      session ? globalSearchQueryKey(session.userId, query) : ['global-search'],
    queryFn: () => fetchGlobalSearch(session as AuthSession, query),
    enabled: !!session && session.status === 'active',
    staleTime: 30_000,
  });
}
