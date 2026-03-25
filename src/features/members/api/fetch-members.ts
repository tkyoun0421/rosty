import { useQuery } from '@tanstack/react-query';

import type {
  ProfileGender,
  UserRole,
  UserStatus,
} from '@/features/auth/model/auth-types';
import type { MemberRecord } from '@/features/members/model/member-management';
import {
  hasSupabaseConfig,
  supabaseClient,
} from '@/shared/lib/supabase/client';

export const membersQueryKey = ['members'] as const;

type MemberRow = {
  id: string;
  full_name: string;
  phone_number: string;
  gender: ProfileGender;
  role: UserRole;
  status: UserStatus | 'deactivated';
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchMembers(): Promise<MemberRecord[]> {
  if (!supabaseClient) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .select(
      'id, full_name, phone_number, gender, role, status, approved_at, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
    .returns<MemberRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((member) => ({
    id: member.id,
    fullName: member.full_name,
    phoneNumber: member.phone_number,
    gender: member.gender,
    role: member.role,
    status: member.status,
    createdAt: member.created_at,
    updatedAt: member.updated_at,
    approvedAt: member.approved_at,
  }));
}

export function useMembersQuery(enabled = true) {
  return useQuery({
    queryKey: membersQueryKey,
    queryFn: fetchMembers,
    enabled: enabled && hasSupabaseConfig,
    staleTime: 15_000,
  });
}
