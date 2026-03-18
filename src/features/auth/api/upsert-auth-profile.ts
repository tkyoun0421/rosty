import type { ProfileGender, UserRole } from '@/features/auth/model/auth-types';
import { supabaseClient } from '@/shared/lib/supabase/client';

type UpsertAuthProfileInput = {
  userId: string;
  fullName: string;
  phoneNumber: string;
  gender: ProfileGender;
  role: UserRole;
};

export async function upsertAuthProfile(
  input: UpsertAuthProfileInput,
): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase auth is not configured for this build.');
  }

  const { error } = await supabaseClient.from('profiles').upsert(
    {
      id: input.userId,
      full_name: input.fullName,
      phone_number: input.phoneNumber,
      gender: input.gender,
      role: input.role,
      status: 'pending_approval',
    },
    {
      onConflict: 'id',
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
