import { useQuery } from '@tanstack/react-query';

import {
  scheduleSeedRows,
  scheduleSlotSeedRows,
} from '@/features/schedules/api/schedule-read-fallback';
import {
  buildScheduleTitle,
  type AvailabilityCollectionState,
  type RequiredGender,
  type ScheduleListItem,
  type ScheduleStatus,
} from '@/features/schedules/model/schedules';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';

export type ScheduleListSnapshot = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  items: ScheduleListItem[];
};

type ScheduleRow = {
  id: string;
  event_date: string;
  package_count: number;
  status: ScheduleStatus;
  collection_state: AvailabilityCollectionState;
  memo: string | null;
};

type ScheduleSlotRow = {
  id: string;
  schedule_id: string;
  position_name: string;
  headcount: number;
  required_gender: RequiredGender;
  is_enabled: boolean;
};

export const scheduleListQueryKey = ['schedules'] as const;

function mapScheduleList(
  schedules: ScheduleRow[],
  slots: ScheduleSlotRow[],
): ScheduleListItem[] {
  return schedules
    .map((schedule) => ({
      id: schedule.id,
      title: buildScheduleTitle({
        eventDate: schedule.event_date,
        memo: schedule.memo,
        packageCount: schedule.package_count,
      }),
      eventDate: schedule.event_date,
      packageCount: schedule.package_count,
      status: schedule.status,
      collectionState: schedule.collection_state,
      enabledSlotCount: slots.filter(
        (slot) => slot.schedule_id === schedule.id && slot.is_enabled,
      ).length,
    }))
    .sort((left, right) => left.eventDate.localeCompare(right.eventDate));
}

function createSeedScheduleList(message: string | null): ScheduleListSnapshot {
  return {
    source: 'seed',
    sourceMessage: message,
    items: mapScheduleList(scheduleSeedRows, scheduleSlotSeedRows),
  };
}

async function fetchLiveScheduleList(): Promise<ScheduleListSnapshot> {
  if (!supabaseClient) {
    return createSeedScheduleList(
      'Supabase config is missing, so Schedule List is using the local seeded snapshot.',
    );
  }

  const [schedulesResult, slotsResult] = await Promise.all([
    supabaseClient
      .from('schedules')
      .select('id, event_date, package_count, status, collection_state, memo')
      .returns<ScheduleRow[]>(),
    supabaseClient
      .from('schedule_slots')
      .select('id, schedule_id, position_name, headcount, required_gender, is_enabled')
      .returns<ScheduleSlotRow[]>(),
  ]);

  const error = schedulesResult.error ?? slotsResult.error;

  if (error) {
    return createSeedScheduleList(error.message);
  }

  return {
    source: 'supabase',
    sourceMessage: null,
    items: mapScheduleList(schedulesResult.data ?? [], slotsResult.data ?? []),
  };
}

export async function fetchScheduleList(): Promise<ScheduleListSnapshot> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedScheduleList(
      'Supabase config is missing, so Schedule List is using the local seeded snapshot.',
    );
  }

  return fetchLiveScheduleList();
}

export function useScheduleListQuery() {
  return useQuery({
    queryKey: scheduleListQueryKey,
    queryFn: fetchScheduleList,
    staleTime: 30_000,
  });
}
