import { useQuery } from '@tanstack/react-query';

import type {
  ProfileGender,
  UserRole,
  UserStatus,
} from '@/features/auth/model/auth-types';
import { hasSupabaseConfig, supabaseClient } from '@/shared/lib/supabase/client';

export type SettingsProfile = {
  id: string;
  fullName: string;
  phoneNumber: string;
  gender: ProfileGender;
  role: UserRole;
  status: UserStatus;
};

type SettingsProfileRow = {
  id: string;
  full_name: string;
  phone_number: string;
  gender: ProfileGender;
  role: UserRole;
  status: UserStatus;
};

export function settingsProfileQueryKey(userId: string) {
  return ['settings-profile', userId] as const;
}

export async function fetchSettingsProfile(
  userId: string,
): Promise<SettingsProfile | null> {
  if (!supabaseClient) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, phone_number, gender, role, status')
    .eq('id', userId)
    .maybeSingle<SettingsProfileRow>();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    fullName: data.full_name,
    phoneNumber: data.phone_number,
    gender: data.gender,
    role: data.role,
    status: data.status,
  };
}

export function useSettingsProfileQuery(userId: string | null) {
  return useQuery({
    queryKey: userId ? settingsProfileQueryKey(userId) : ['settings-profile'],
    queryFn: () => fetchSettingsProfile(userId ?? ''),
    enabled: !!userId && hasSupabaseConfig,
    staleTime: 30_000,
  });
}
