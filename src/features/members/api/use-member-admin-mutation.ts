import { useMutation } from '@tanstack/react-query';

import { authProfileQueryKey } from '@/features/auth/api/fetch-auth-profile';
import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession, UserRole } from '@/features/auth/model/auth-types';
import {
  canApproveMember,
  canChangeMemberRole,
  canReactivateMember,
  canSuspendMember,
  type MemberRecord,
} from '@/features/members/model/member-management';
import { queryClient } from '@/shared/lib/react-query/query-client';
import { supabaseClient } from '@/shared/lib/supabase/client';

export type MemberAdminAction =
  | {
      kind: 'approve';
      member: MemberRecord;
      members: MemberRecord[];
    }
  | {
      kind: 'suspend';
      member: MemberRecord;
      members: MemberRecord[];
    }
  | {
      kind: 'reactivate';
      member: MemberRecord;
      members: MemberRecord[];
    }
  | {
      kind: 'change-role';
      member: MemberRecord;
      members: MemberRecord[];
      nextRole: UserRole;
    };

type MemberPatch = {
  role?: UserRole;
  status?: 'pending_approval' | 'active' | 'suspended';
  approved_at?: string | null;
  approved_by?: string | null;
};

async function patchMember(
  memberId: string,
  patch: MemberPatch,
): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Supabase members management is not configured.');
  }

  const { error } = await supabaseClient
    .from('profiles')
    .update(patch)
    .eq('id', memberId);

  if (error) {
    throw new Error(error.message);
  }
}

export function useMemberAdminMutation(adminSession: AuthSession | null) {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  return useMutation({
    mutationFn: async (action: MemberAdminAction) => {
      if (!adminSession || adminSession.role !== 'admin') {
        throw new Error('Only active admins can manage members.');
      }

      switch (action.kind) {
        case 'approve': {
          if (!canApproveMember(action.member)) {
            throw new Error('Only pending users can be approved.');
          }

          await patchMember(action.member.id, {
            status: 'active',
            approved_at: new Date().toISOString(),
            approved_by: adminSession.userId,
          });
          return;
        }
        case 'suspend': {
          if (!canSuspendMember(action.members, action.member)) {
            throw new Error(
              'This member cannot be suspended because it would remove the last active admin or the status is not eligible.',
            );
          }

          await patchMember(action.member.id, {
            status: 'suspended',
          });
          return;
        }
        case 'reactivate': {
          if (!canReactivateMember(action.member)) {
            throw new Error('Only suspended users can be reactivated.');
          }

          await patchMember(action.member.id, {
            status: 'active',
          });
          return;
        }
        case 'change-role': {
          if (
            !canChangeMemberRole(action.members, action.member, action.nextRole)
          ) {
            throw new Error(
              'This role change is blocked because it would remove the last active admin or no change was requested.',
            );
          }

          await patchMember(action.member.id, {
            role: action.nextRole,
          });
        }
      }
    },
    onSuccess: async (_data, action) => {
      await queryClient.invalidateQueries({ queryKey: membersQueryKey });
      await queryClient.invalidateQueries({
        queryKey: authProfileQueryKey(action.member.id),
      });

      if (adminSession?.userId === action.member.id) {
        await restoreSession();
      }
    },
  });
}

const membersQueryKey = ['members'] as const;
