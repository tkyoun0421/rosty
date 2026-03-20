import { supabaseClient } from '@/shared/lib/supabase/client';

type SubmitAvailabilityResponseInput = {
  scheduleId: string;
  status: 'available' | 'unavailable';
};

type SubmitAvailabilityResponseRow = {
  submission_id: string;
  schedule_id: string;
  user_id: string;
  status: 'available' | 'unavailable';
  submitted_at: string;
};

export async function submitAvailabilityResponse(
  input: SubmitAvailabilityResponseInput,
): Promise<SubmitAvailabilityResponseRow> {
  if (!supabaseClient) {
    throw new Error('Supabase auth is not configured for this build.');
  }

  const { data, error } = await supabaseClient
    .rpc('submit_my_availability_response', {
      p_schedule_id: input.scheduleId,
      p_status: input.status,
    })
    .returns<SubmitAvailabilityResponseRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The availability response could not be saved.');
  }

  return data;
}
