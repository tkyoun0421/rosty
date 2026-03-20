import { useQuery } from '@tanstack/react-query';

import {
  scheduleSeedRows,
  scheduleSlotSeedRows,
} from '@/features/schedules/api/schedule-read-fallback';
import {
  buildScheduleTitle,
  type AvailabilityCollectionState,
  type RequiredGender,
  type ScheduleDetail,
  type ScheduleStatus,
} from '@/features/schedules/model/schedules';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';

export type ScheduleDetailSnapshot = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  detail: ScheduleDetail | null;
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

export function scheduleDetailQueryKey(scheduleId: string) {
  return ['schedule-detail', scheduleId] as const;
}

function createScheduleDetail(
  schedule: ScheduleRow | null,
  slots: ScheduleSlotRow[],
): ScheduleDetail | null {
  if (!schedule) {
    return null;
  }

  return {
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
    enabledSlotCount: slots.filter((slot) => slot.is_enabled).length,
    memo: schedule.memo,
    slots: slots
      .map((slot) => ({
        id: slot.id,
        positionName: slot.position_name,
        headcount: slot.headcount,
        requiredGender: slot.required_gender,
        isEnabled: slot.is_enabled,
      }))
      .sort((left, right) => left.positionName.localeCompare(right.positionName)),
  };
}

function createSeedScheduleDetail(
  scheduleId: string,
  message: string | null,
): ScheduleDetailSnapshot {
  return {
    source: 'seed',
    sourceMessage: message,
    detail: createScheduleDetail(
      scheduleSeedRows.find((schedule) => schedule.id === scheduleId) ?? null,
      scheduleSlotSeedRows.filter((slot) => slot.schedule_id === scheduleId),
    ),
  };
}

async function fetchLiveScheduleDetail(
  scheduleId: string,
): Promise<ScheduleDetailSnapshot> {
  if (!supabaseClient) {
    return createSeedScheduleDetail(
      scheduleId,
      'Supabase config is missing, so Schedule Detail is using the local seeded snapshot.',
    );
  }

  const [scheduleResult, slotsResult] = await Promise.all([
    supabaseClient
      .from('schedules')
      .select('id, event_date, package_count, status, collection_state, memo')
      .eq('id', scheduleId)
      .maybeSingle<ScheduleRow>(),
    supabaseClient
      .from('schedule_slots')
      .select('id, schedule_id, position_name, headcount, required_gender, is_enabled')
      .eq('schedule_id', scheduleId)
      .returns<ScheduleSlotRow[]>(),
  ]);

  const error = scheduleResult.error ?? slotsResult.error;

  if (error) {
    return createSeedScheduleDetail(scheduleId, error.message);
  }

  return {
    source: 'supabase',
    sourceMessage: null,
    detail: createScheduleDetail(scheduleResult.data ?? null, slotsResult.data ?? []),
  };
}

export async function fetchScheduleDetail(
  scheduleId: string,
): Promise<ScheduleDetailSnapshot> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedScheduleDetail(
      scheduleId,
      'Supabase config is missing, so Schedule Detail is using the local seeded snapshot.',
    );
  }

  return fetchLiveScheduleDetail(scheduleId);
}

export function useScheduleDetailQuery(scheduleId: string | null) {
  return useQuery({
    queryKey: scheduleId ? scheduleDetailQueryKey(scheduleId) : ['schedule-detail'],
    queryFn: () => fetchScheduleDetail(scheduleId ?? ''),
    enabled: !!scheduleId,
    staleTime: 30_000,
  });
}
