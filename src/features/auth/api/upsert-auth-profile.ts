import type { ProfileGender, UserRole, UserStatus } from '@/features/auth/model/auth-types';
import { supabaseClient } from '@/shared/lib/supabase/client';

type UpsertAuthProfileInput = {
  fullName: string;
  phoneNumber: string;
  gender: ProfileGender;
};

type CompleteProfileSetupRow = {
  profile_id: string;
  role: UserRole;
  status: UserStatus;
};

export async function upsertAuthProfile(
  input: UpsertAuthProfileInput,
): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase auth is not configured for this build.');
  }

  const { data, error } = await supabaseClient
    .rpc('complete_profile_setup', {
      p_full_name: input.fullName,
      p_phone_number: input.phoneNumber,
      p_gender: input.gender,
    })
    .returns<CompleteProfileSetupRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Profile setup could not be completed.');
  }
}