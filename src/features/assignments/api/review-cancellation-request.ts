import { supabaseClient } from '@/shared/lib/supabase/client';

type ReviewCancellationAction = 'approve' | 'reject';

type ReviewCancellationRequestInput = {
  requestId: string;
  action: ReviewCancellationAction;
};

type ReviewCancellationResultRow = {
  request_id: string;
  request_status: 'approved' | 'rejected';
  assignment_id: string;
  assignment_status: 'cancelled' | 'confirmed';
};

export async function reviewCancellationRequest(
  input: ReviewCancellationRequestInput,
): Promise<ReviewCancellationResultRow> {
  if (!supabaseClient) {
    throw new Error('Supabase auth is not configured for this build.');
  }

  const { data, error } = await supabaseClient
    .rpc('review_cancellation_request', {
      p_request_id: input.requestId,
      p_action: input.action,
    })
    .returns<ReviewCancellationResultRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The cancellation review could not be completed.');
  }

  return data;
}
