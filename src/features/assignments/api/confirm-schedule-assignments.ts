import { confirmWorkspaceSeedSchedule } from '@/features/assignments/api/assignment-workspace-fallback';
import { supabaseClient } from '@/shared/lib/supabase/client';

type ConfirmScheduleAssignmentsRow = {
  schedule_id: string;
  schedule_status: 'assigned';
  confirmed_assignment_count: number;
};

export async function confirmScheduleAssignments(
  scheduleId: string,
): Promise<ConfirmScheduleAssignmentsRow> {
  if (!supabaseClient) {
    confirmWorkspaceSeedSchedule(scheduleId);
    return {
      schedule_id: scheduleId,
      schedule_status: 'assigned',
      confirmed_assignment_count: 0,
    };
  }

  const { data, error } = await supabaseClient
    .rpc('confirm_schedule_assignments', {
      p_schedule_id: scheduleId,
    })
    .returns<ConfirmScheduleAssignmentsRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The schedule assignments could not be confirmed.');
  }

  return data;
}
