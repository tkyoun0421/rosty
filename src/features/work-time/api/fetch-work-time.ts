import { useQuery } from '@tanstack/react-query';

import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';
import type { WorkTimeRecord, WorkTimeStatus } from '@/features/work-time/model/work-time';
import { readSeedWorkTime } from '@/features/work-time/api/work-time-fallback';

export type WorkTimeSnapshot = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  record: WorkTimeRecord | null;
};

type WorkTimeRow = {
  schedule_id: string;
  planned_start_at: string | null;
  planned_end_at: string | null;
  actual_start_at: string | null;
  actual_end_at: string | null;
  status: WorkTimeStatus;
  updated_at: string | null;
};

export function workTimeQueryKey(scheduleId: string) {
  return ['work-time', scheduleId] as const;
}

function mapWorkTimeRow(row: WorkTimeRow | null): WorkTimeRecord | null {
  if (!row) {
    return null;
  }

  return {
    scheduleId: row.schedule_id,
    plannedStartAt: row.planned_start_at,
    plannedEndAt: row.planned_end_at,
    actualStartAt: row.actual_start_at,
    actualEndAt: row.actual_end_at,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function createSeedWorkTimeSnapshot(
  scheduleId: string,
  message: string | null,
): WorkTimeSnapshot {
  const seeded = readSeedWorkTime(scheduleId);

  return {
    source: 'seed',
    sourceMessage: message,
    record: seeded
      ? mapWorkTimeRow({
          schedule_id: scheduleId,
          planned_start_at: seeded.planned_start_at,
          planned_end_at: seeded.planned_end_at,
          actual_start_at: seeded.actual_start_at,
          actual_end_at: seeded.actual_end_at,
          status: seeded.status,
          updated_at: seeded.updated_at,
        })
      : null,
  };
}

async function fetchLiveWorkTime(scheduleId: string): Promise<WorkTimeSnapshot> {
  if (!supabaseClient) {
    return createSeedWorkTimeSnapshot(
      scheduleId,
      'Supabase config is missing, so Work Time is using the local seeded snapshot.',
    );
  }

  const { data, error } = await supabaseClient
    .from('schedule_time_records')
    .select(
      'schedule_id, planned_start_at, planned_end_at, actual_start_at, actual_end_at, status, updated_at',
    )
    .eq('schedule_id', scheduleId)
    .maybeSingle<WorkTimeRow>();

  if (error) {
    return createSeedWorkTimeSnapshot(scheduleId, error.message);
  }

  return {
    source: 'supabase',
    sourceMessage: null,
    record: mapWorkTimeRow(data ?? null),
  };
}

export async function fetchWorkTime(scheduleId: string): Promise<WorkTimeSnapshot> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedWorkTimeSnapshot(
      scheduleId,
      'Supabase config is missing, so Work Time is using the local seeded snapshot.',
    );
  }

  return fetchLiveWorkTime(scheduleId);
}

export function useWorkTimeQuery(scheduleId: string | null) {
  return useQuery({
    queryKey: scheduleId ? workTimeQueryKey(scheduleId) : ['work-time'],
    queryFn: () => fetchWorkTime(scheduleId ?? ''),
    enabled: !!scheduleId,
    staleTime: 30_000,
  });
}
