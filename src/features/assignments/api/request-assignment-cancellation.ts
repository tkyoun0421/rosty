import { supabaseClient } from '@/shared/lib/supabase/client';

type RequestAssignmentCancellationInput = {
  assignmentId: string;
  reason: string;
};

type AssignmentCancellationResultRow = {
  request_id: string;
  assignment_id: string;
  assignment_status: 'cancel_requested';
  request_status: 'requested';
};

export async function requestAssignmentCancellation(
  input: RequestAssignmentCancellationInput,
): Promise<AssignmentCancellationResultRow> {
  if (!supabaseClient) {
    throw new Error('Supabase auth is not configured for this build.');
  }

  const { data, error } = await supabaseClient
    .rpc('request_assignment_cancellation', {
      p_assignment_id: input.assignmentId,
      p_reason: input.reason,
    })
    .returns<AssignmentCancellationResultRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The cancellation request could not be created.');
  }

  return data;
}
