import { useMutation } from '@tanstack/react-query';

import { authProfileQueryKey } from '@/features/auth/api/fetch-auth-profile';
import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession, UserRole } from '@/features/auth/model/auth-types';
import { membersQueryKey } from '@/features/members/api/fetch-members';
import {
  manageMemberAccount,
  manageMembersBulk,
} from '@/features/members/api/manage-member-account';
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
    }
  | {
      kind: 'bulk-approve';
      targets: MemberRecord[];
    }
  | {
      kind: 'bulk-suspend';
      targets: MemberRecord[];
      members: MemberRecord[];
    }
  | {
      kind: 'bulk-reactivate';
      targets: MemberRecord[];
    }
  | {
      kind: 'bulk-change-role';
      targets: MemberRecord[];
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
          return;
        }
        case 'bulk-approve': {
          if (action.targets.length === 0) {
            throw new Error('Choose at least one pending user.');
          }

          if (!action.targets.every(canApproveMember)) {
            throw new Error('Only pending users can be approved.');
          }

          await manageMembersBulk({
            memberIds: action.targets.map((member) => member.id),
            action: 'approve',
          });
          return;
        }
        case 'bulk-suspend': {
          if (action.targets.length === 0) {
            throw new Error('Choose at least one eligible member to suspend.');
          }

          if (
            !action.targets.every((member) =>
              canSuspendMember(action.members, member),
            )
          ) {
            throw new Error(
              'This bulk suspend request includes a member that cannot be suspended.',
            );
          }

          await manageMembersBulk({
            memberIds: action.targets.map((member) => member.id),
            action: 'suspend',
          });
          return;
        }
        case 'bulk-reactivate': {
          if (action.targets.length === 0) {
            throw new Error('Choose at least one suspended user to reactivate.');
          }

          if (!action.targets.every(canReactivateMember)) {
            throw new Error('Only suspended users can be reactivated.');
          }

          await manageMembersBulk({
            memberIds: action.targets.map((member) => member.id),
            action: 'reactivate',
          });
          return;
        }
        case 'bulk-change-role': {
          if (action.targets.length === 0) {
            throw new Error('Choose at least one eligible member for the role change.');
          }

          if (
            !action.targets.every((member) =>
              canChangeMemberRole(action.members, member, action.nextRole),
            )
          ) {
            throw new Error(
              'This bulk role change request includes a member that cannot move to the selected role.',
            );
          }

          await manageMembersBulk({
            memberIds: action.targets.map((member) => member.id),
            action: 'change-role',
            nextRole: action.nextRole,
          });
          return;
        }
      }
    },
    onSuccess: async (_data, action) => {
      await queryClient.invalidateQueries({ queryKey: membersQueryKey });

      const affectedMemberIds =
        'member' in action
          ? [action.member.id]
          : action.targets.map((member) => member.id);

      await Promise.all(
        [...new Set(affectedMemberIds)].map((memberId) =>
          queryClient.invalidateQueries({
            queryKey: authProfileQueryKey(memberId),
          }),
        ),
      );

      if (
        adminSession?.userId &&
        affectedMemberIds.includes(adminSession.userId)
      ) {
        await restoreSession();
      }
    },
  });
}
