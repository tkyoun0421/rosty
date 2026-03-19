import { useQuery } from '@tanstack/react-query';

import type { UserRole } from '@/features/auth/model/auth-types';
import type { InvitationLinkRecord } from '@/features/invitations/model/invitation-management';
import {
  hasSupabaseConfig,
  supabaseClient,
} from '@/shared/lib/supabase/client';

export function invitationJoinQueryKey(token: string) {
  return ['invitation-link', 'join', token] as const;
}

type InvitationJoinRow = {
  id: string;
  token: string;
  target_role: UserRole;
  created_by: string;
  expires_at: string;
  consumed_at: string | null;
  disabled_at: string | null;
  created_at: string;
};

export async function fetchInvitationForJoin(
  token: string,
): Promise<InvitationLinkRecord | null> {
  if (!supabaseClient || token.trim().length === 0) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from('invitation_links')
    .select(
      'id, token, target_role, created_by, expires_at, consumed_at, disabled_at, created_at',
    )
    .eq('token', token)
    .maybeSingle<InvitationJoinRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    token: data.token,
    targetRole: data.target_role,
    createdBy: data.created_by,
    expiresAt: data.expires_at,
    consumedAt: data.consumed_at,
    disabledAt: data.disabled_at,
    createdAt: data.created_at,
  };
}

export function useInvitationJoinQuery(
  token: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: invitationJoinQueryKey(token ?? 'missing'),
    queryFn: () => fetchInvitationForJoin(token ?? ''),
    enabled: enabled && hasSupabaseConfig && !!token,
    staleTime: 15_000,
  });
}
