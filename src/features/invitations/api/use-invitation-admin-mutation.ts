import { useMutation } from '@tanstack/react-query';

import type { AuthSession } from '@/features/auth/model/auth-types';
import { invitationLinksQueryKey } from '@/features/invitations/api/fetch-invitation-links';
import {
  canDisableInvitation,
  canReissueInvitation,
  createInvitationToken,
  getInvitationExpiryDate,
  type InvitationLinkRecord,
} from '@/features/invitations/model/invitation-management';
import { queryClient } from '@/shared/lib/react-query/query-client';
import { supabaseClient } from '@/shared/lib/supabase/client';

export type InvitationAdminAction =
  | {
      kind: 'issue';
    }
  | {
      kind: 'disable';
      invitation: InvitationLinkRecord;
    }
  | {
      kind: 'reissue';
      invitation: InvitationLinkRecord;
    };

export type InvitationAdminMutationResult =
  | {
      kind: 'issue';
      token: string;
      expiresAt: string;
      replacedInvitationId: null;
    }
  | {
      kind: 'reissue';
      token: string;
      expiresAt: string;
      replacedInvitationId: string;
    }
  | {
      kind: 'disable';
      disabledInvitationId: string;
    };

type InvitationInsert = {
  token: string;
  target_role: 'employee';
  created_by: string;
  expires_at: string;
};

async function insertInvitationLink(
  adminUserId: string,
  now: Date,
): Promise<Extract<InvitationAdminMutationResult, { kind: 'issue' }>> {
  if (!supabaseClient) {
    throw new Error('Supabase invitation management is not configured.');
  }

  const token = createInvitationToken(now);
  const expiresAt = getInvitationExpiryDate(now).toISOString();
  const payload: InvitationInsert = {
    token,
    target_role: 'employee',
    created_by: adminUserId,
    expires_at: expiresAt,
  };

  const { error } = await supabaseClient.from('invitation_links').insert(payload);

  if (error) {
    throw new Error(error.message);
  }

  return {
    kind: 'issue',
    token,
    expiresAt,
    replacedInvitationId: null,
  };
}

async function disableInvitationLink(
  invitationId: string,
  disabledAt: string,
): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase invitation management is not configured.');
  }

  const { error } = await supabaseClient
    .from('invitation_links')
    .update({ disabled_at: disabledAt })
    .eq('id', invitationId);

  if (error) {
    throw new Error(error.message);
  }
}

export function useInvitationAdminMutation(adminSession: AuthSession | null) {
  return useMutation({
    mutationFn: async (
      action: InvitationAdminAction,
    ): Promise<InvitationAdminMutationResult> => {
      if (!adminSession || adminSession.role !== 'admin') {
        throw new Error('Only active admins can manage invitation links.');
      }

      switch (action.kind) {
        case 'issue': {
          return insertInvitationLink(adminSession.userId, new Date());
        }
        case 'disable': {
          if (!canDisableInvitation(action.invitation)) {
            throw new Error('Only active invitation links can be disabled.');
          }

          await disableInvitationLink(
            action.invitation.id,
            new Date().toISOString(),
          );
          return {
            kind: 'disable',
            disabledInvitationId: action.invitation.id,
          };
        }
        case 'reissue': {
          if (!canReissueInvitation(action.invitation)) {
            throw new Error('Only active invitation links can be reissued.');
          }

          const now = new Date();
          await disableInvitationLink(action.invitation.id, now.toISOString());

          const issued = await insertInvitationLink(adminSession.userId, now);
          return {
            kind: 'reissue',
            token: issued.token,
            expiresAt: issued.expiresAt,
            replacedInvitationId: action.invitation.id,
          };
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invitationLinksQueryKey });
    },
  });
}
