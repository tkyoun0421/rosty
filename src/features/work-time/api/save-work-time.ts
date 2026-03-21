import { saveSeedWorkTime } from '@/features/work-time/api/work-time-fallback';
import { supabaseClient } from '@/shared/lib/supabase/client';
import type { WorkTimeStatus } from '@/features/work-time/model/work-time';

type SaveWorkTimeInput = {
  scheduleId: string;
  actorUserId: string;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  status: WorkTimeStatus;
};

type SaveWorkTimeRow = {
  schedule_id: string;
  planned_start_at: string | null;
  planned_end_at: string | null;
  actual_start_at: string | null;
  actual_end_at: string | null;
  status: WorkTimeStatus;
  updated_at: string | null;
};

export async function saveWorkTime(
  input: SaveWorkTimeInput,
): Promise<SaveWorkTimeRow> {
  if (!supabaseClient) {
    saveSeedWorkTime(input.scheduleId, {
      planned_start_at: input.plannedStartAt,
      planned_end_at: input.plannedEndAt,
      actual_start_at: input.actualStartAt,
      actual_end_at: input.actualEndAt,
      status: input.status,
    });

    return {
      schedule_id: input.scheduleId,
      planned_start_at: input.plannedStartAt,
      planned_end_at: input.plannedEndAt,
      actual_start_at: input.actualStartAt,
      actual_end_at: input.actualEndAt,
      status: input.status,
      updated_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabaseClient
    .from('schedule_time_records')
    .upsert(
      {
        schedule_id: input.scheduleId,
        planned_start_at: input.plannedStartAt,
        planned_end_at: input.plannedEndAt,
        actual_start_at: input.actualStartAt,
        actual_end_at: input.actualEndAt,
        status: input.status,
        updated_by: input.actorUserId,
      },
      {
        onConflict: 'schedule_id',
      },
    )
    .select(
      'schedule_id, planned_start_at, planned_end_at, actual_start_at, actual_end_at, status, updated_at',
    )
    .single<SaveWorkTimeRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The work time record could not be saved.');
  }

  return data;
}
