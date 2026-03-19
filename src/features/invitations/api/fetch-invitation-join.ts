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

  const { data, error } = await supabaseClient.rpc(
    'get_employee_invitation_status',
    {
      p_invitation_token: token,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  const invitation = Array.isArray(data)
    ? (data[0] as InvitationJoinRow | undefined)
    : undefined;

  if (!invitation) {
    return null;
  }

  return {
    id: invitation.id,
    token: invitation.token,
    targetRole: invitation.target_role,
    createdBy: invitation.created_by,
    expiresAt: invitation.expires_at,
    consumedAt: invitation.consumed_at,
    disabledAt: invitation.disabled_at,
    createdAt: invitation.created_at,
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