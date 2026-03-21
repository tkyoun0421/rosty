import type {
  ProfileGender,
  UserRole,
  UserStatus,
} from '@/features/auth/model/auth-types';
import { supabaseClient } from '@/shared/lib/supabase/client';

type UpdateSettingsProfileInput = {
  fullName: string;
  phoneNumber: string;
  gender: ProfileGender;
};

type UpdateSettingsProfileRow = {
  profile_id: string;
  full_name: string;
  phone_number: string;
  gender: ProfileGender;
  role: UserRole;
  status: UserStatus;
};

export async function updateSettingsProfile(
  input: UpdateSettingsProfileInput,
): Promise<UpdateSettingsProfileRow> {
  if (!supabaseClient) {
    throw new Error('Supabase auth is not configured for this build.');
  }

  const { data, error } = await supabaseClient
    .rpc('update_my_profile', {
      p_full_name: input.fullName,
      p_phone_number: input.phoneNumber,
      p_gender: input.gender,
    })
    .returns<UpdateSettingsProfileRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The profile could not be updated.');
  }

  return data;
}
