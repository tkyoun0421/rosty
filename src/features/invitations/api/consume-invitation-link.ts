import type { ProfileGender } from '@/features/auth/model/auth-types';
import { supabaseClient } from '@/shared/lib/supabase/client';

type CompleteEmployeeJoinInput = {
  invitationToken: string;
  fullName: string;
  phoneNumber: string;
  gender: ProfileGender;
};

type CompleteEmployeeJoinRow = {
  profile_id: string;
  consumed_at: string;
};

export async function completeEmployeeJoin(
  input: CompleteEmployeeJoinInput,
): Promise<{ profileId: string; consumedAt: string }> {
  if (!supabaseClient) {
    throw new Error('Supabase invitation management is not configured.');
  }

  const { data, error } = await supabaseClient
    .rpc('complete_employee_join', {
      p_invitation_token: input.invitationToken,
      p_full_name: input.fullName,
      p_phone_number: input.phoneNumber,
      p_gender: input.gender,
    })
    .returns<CompleteEmployeeJoinRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Employee join could not be completed.');
  }

  return {
    profileId: data.profile_id,
    consumedAt: data.consumed_at,
  };
}