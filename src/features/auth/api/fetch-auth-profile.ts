import type { UserRole, UserStatus } from '@/features/auth/model/auth-types';
import { supabaseClient } from '@/shared/lib/supabase/client';

export type AuthProfile = {
  fullName: string | null;
  role: UserRole | null;
  status: UserStatus | null;
};

type AuthProfileRow = {
  full_name: string | null;
  role: UserRole | null;
  status: UserStatus | null;
};

export function authProfileQueryKey(userId: string) {
  return ['auth', 'profile', userId] as const;
}

export async function fetchAuthProfile(
  userId: string,
): Promise<AuthProfile | null> {
  if (!supabaseClient) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('full_name, role, status')
    .eq('id', userId)
    .maybeSingle<AuthProfileRow>();

  if (error || !data) {
    return null;
  }

  return {
    fullName: data.full_name,
    role: data.role,
    status: data.status,
  };
}
