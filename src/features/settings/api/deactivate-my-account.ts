import type { UserRole } from '@/features/auth/model/auth-types';
import { supabaseClient } from '@/shared/lib/supabase/client';

type DeactivateMyAccountRow = {
  profile_id: string;
  role: UserRole;
  status: 'deactivated';
};

export async function deactivateMyAccount(): Promise<DeactivateMyAccountRow> {
  if (!supabaseClient) {
    throw new Error('Supabase auth is not configured for this build.');
  }

  const { data, error } = await supabaseClient
    .rpc('deactivate_my_account')
    .returns<DeactivateMyAccountRow[]>()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('The account could not be deactivated.');
  }

  return data;
}
