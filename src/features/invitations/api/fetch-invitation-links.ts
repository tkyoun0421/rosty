import { useQuery } from '@tanstack/react-query';

import type { UserRole } from '@/features/auth/model/auth-types';
import type { InvitationLinkRecord } from '@/features/invitations/model/invitation-management';
import {
  hasSupabaseConfig,
  supabaseClient,
} from '@/shared/lib/supabase/client';

export const invitationLinksQueryKey = ['invitation-links'] as const;

type InvitationLinkRow = {
  id: string;
  token: string;
  target_role: UserRole;
  created_by: string;
  expires_at: string;
  consumed_at: string | null;
  disabled_at: string | null;
  created_at: string;
};

export async function fetchInvitationLinks(): Promise<InvitationLinkRecord[]> {
  if (!supabaseClient) {
    return [];
  }

  const { data, error } = await supabaseClient
    .from('invitation_links')
    .select(
      'id, token, target_role, created_by, expires_at, consumed_at, disabled_at, created_at',
    )
    .order('created_at', { ascending: false })
    .returns<InvitationLinkRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((invitation) => ({
    id: invitation.id,
    token: invitation.token,
    targetRole: invitation.target_role,
    createdBy: invitation.created_by,
    expiresAt: invitation.expires_at,
    consumedAt: invitation.consumed_at,
    disabledAt: invitation.disabled_at,
    createdAt: invitation.created_at,
  }));
}

export function useInvitationLinksQuery(enabled = true) {
  return useQuery({
    queryKey: invitationLinksQueryKey,
    queryFn: fetchInvitationLinks,
    enabled: enabled && hasSupabaseConfig,
    staleTime: 15_000,
  });
}
