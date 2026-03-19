import { useMutation } from '@tanstack/react-query';

import { authProfileQueryKey } from '@/features/auth/api/fetch-auth-profile';
import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession, UserRole } from '@/features/auth/model/auth-types';
import { membersQueryKey } from '@/features/members/api/fetch-members';
import { manageMemberAccount } from '@/features/members/api/manage-member-account';
import {
  canApproveMember,
  canChangeMemberRole,
  canReactivateMember,
  canSuspendMember,
  type MemberRecord,
} from '@/features/members/model/member-management';
import { queryClient } from '@/shared/lib/react-query/query-client';

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

          await manageMemberAccount({
            memberId: action.member.id,
            action: 'approve',
          });
          return;
        }
        case 'suspend': {
          if (!canSuspendMember(action.members, action.member)) {
            throw new Error(
              'This member cannot be suspended because it would remove the last active admin or the status is not eligible.',
            );
          }

          await manageMemberAccount({
            memberId: action.member.id,
            action: 'suspend',
          });
          return;
        }
        case 'reactivate': {
          if (!canReactivateMember(action.member)) {
            throw new Error('Only suspended users can be reactivated.');
          }

          await manageMemberAccount({
            memberId: action.member.id,
            action: 'reactivate',
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

          await manageMemberAccount({
            memberId: action.member.id,
            action: 'change-role',
            nextRole: action.nextRole,
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
