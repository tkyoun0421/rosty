import { completeSeedScheduleOperation } from '@/features/work-time/api/work-time-fallback';
import { supabaseClient } from '@/shared/lib/supabase/client';

type CompleteScheduleOperationRow = {
  schedule_id: string;
  schedule_status: 'completed';
  completed_assignment_count: number;
};

export async function completeScheduleOperation(
  scheduleId: string,
): Promise<CompleteScheduleOperationRow> {
  if (!supabaseClient) {
    return completeSeedScheduleOperation(scheduleId);
  }

  const { data, error } = await supabaseClient
    .rpc('complete_schedule_operation', {
      p_schedule_id: scheduleId,
    })
    .returns<CompleteScheduleOperationRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The schedule could not be completed.');
  }

  return data;
}
