import { useQuery } from '@tanstack/react-query';

import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';
import type { AvailabilityResponseState } from '@/features/availability/model/availability-submission';

export type MyAvailabilitySnapshot = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  state: AvailabilityResponseState;
};

type AvailabilitySubmissionRow = {
  status: 'available' | 'unavailable';
};

export const seededAvailabilityByScheduleId: Record<
  string,
  AvailabilityResponseState
> = {
  'schedule-1': 'available',
  'schedule-2': 'not_responded',
  'schedule-3': 'unavailable',
};

export function myAvailabilityQueryKey(scheduleId: string, userId: string) {
  return ['my-availability', scheduleId, userId] as const;
}

function createSeedAvailability(
  scheduleId: string,
  message: string | null,
): MyAvailabilitySnapshot {
  return {
    source: 'seed',
    sourceMessage: message,
    state: seededAvailabilityByScheduleId[scheduleId] ?? 'not_responded',
  };
}

async function fetchLiveMyAvailability(
  scheduleId: string,
  userId: string,
): Promise<MyAvailabilitySnapshot> {
  if (!supabaseClient) {
    return createSeedAvailability(
      scheduleId,
      'Supabase config is missing, so availability is using the local seeded snapshot.',
    );
  }

  const { data, error } = await supabaseClient
    .from('availability_submissions')
    .select('status')
    .eq('schedule_id', scheduleId)
    .eq('user_id', userId)
    .maybeSingle<AvailabilitySubmissionRow>();

  if (error) {
    return createSeedAvailability(scheduleId, error.message);
  }

  return {
    source: 'supabase',
    sourceMessage: null,
    state: data?.status ?? 'not_responded',
  };
}

export async function fetchMyAvailability(
  scheduleId: string,
  userId: string,
): Promise<MyAvailabilitySnapshot> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedAvailability(
      scheduleId,
      'Supabase config is missing, so availability is using the local seeded snapshot.',
    );
  }

  return fetchLiveMyAvailability(scheduleId, userId);
}

export function useMyAvailabilityQuery(
  scheduleId: string | null,
  userId: string | null,
) {
  return useQuery({
    queryKey:
      scheduleId && userId
        ? myAvailabilityQueryKey(scheduleId, userId)
        : ['my-availability'],
    queryFn: () => fetchMyAvailability(scheduleId ?? '', userId ?? ''),
    enabled: !!scheduleId && !!userId,
    staleTime: 30_000,
  });
}
