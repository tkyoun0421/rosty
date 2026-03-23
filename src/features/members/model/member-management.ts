import type {
  ProfileGender,
  UserRole,
  UserStatus,
} from '@/features/auth/model/auth-types';

export type MemberStatus = UserStatus | 'deactivated';

export type MemberRecord = {
  id: string;
  fullName: string;
  phoneNumber: string;
  gender: ProfileGender;
  role: UserRole;
  status: MemberStatus;
  approvedAt: string | null;
};

export type MemberListTab =
  | 'all'
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'deactivated';

export type MemberRoleChip = 'all' | UserRole;

export function getPendingMembers(members: MemberRecord[]): MemberRecord[] {
  return members.filter((member) => member.status === 'pending_approval');
}

export function getActiveMembers(members: MemberRecord[]): MemberRecord[] {
  return members.filter((member) => member.status === 'active');
}

export function getSuspendedMembers(members: MemberRecord[]): MemberRecord[] {
  return members.filter((member) => member.status === 'suspended');
}

export function getDeactivatedMembers(members: MemberRecord[]): MemberRecord[] {
  return members.filter((member) => member.status === 'deactivated');
}

export function filterMembersList(input: {
  members: MemberRecord[];
  tab: MemberListTab;
  roleChip: MemberRoleChip;
}): MemberRecord[] {
  return input.members.filter((member) => {
    const tabMatch =
      input.tab === 'all' ? true : member.status === input.tab;
    const roleMatch =
      input.roleChip === 'all' ? true : member.role === input.roleChip;

    return tabMatch && roleMatch;
  });
}

export function countActiveAdmins(members: MemberRecord[]): number {
  return members.filter(
    (member) => member.role === 'admin' && member.status === 'active',
  ).length;
}

export function isLastActiveAdmin(
  members: MemberRecord[],
  targetMemberId: string,
): boolean {
  const targetMember = members.find((member) => member.id === targetMemberId);

  if (!targetMember) {
    return false;
  }

  return (
    targetMember.role === 'admin' &&
    targetMember.status === 'active' &&
    countActiveAdmins(members) <= 1
  );
}

export function canApproveMember(member: MemberRecord): boolean {
  return member.status === 'pending_approval';
}

export function canSuspendMember(
  members: MemberRecord[],
  member: MemberRecord,
): boolean {
  const allowedStatus =
    member.status === 'pending_approval' || member.status === 'active';

  return allowedStatus && !isLastActiveAdmin(members, member.id);
}

export function canReactivateMember(member: MemberRecord): boolean {
  return member.status === 'suspended';
}

export function canChangeMemberRole(
  members: MemberRecord[],
  member: MemberRecord,
  nextRole: UserRole,
): boolean {
  if (member.status === 'deactivated') {
    return false;
  }

  if (member.role === nextRole) {
    return false;
  }

  if (
    member.role === 'admin' &&
    nextRole !== 'admin' &&
    isLastActiveAdmin(members, member.id)
  ) {
    return false;
  }

  return true;
}

export function getLastAdminProtectionMessage(
  members: MemberRecord[],
  member: MemberRecord,
): string | null {
  if (!isLastActiveAdmin(members, member.id)) {
    return null;
  }

  return 'The last active admin cannot be suspended or downgraded.';
}
