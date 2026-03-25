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
  createdAt: string;
  updatedAt: string;
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
  query?: string;
}): MemberRecord[] {
  const normalizedQuery = input.query?.trim().toLowerCase() ?? '';

  return input.members.filter((member) => {
    const tabMatch =
      input.tab === 'all' ? true : member.status === input.tab;
    const roleMatch =
      input.roleChip === 'all' ? true : member.role === input.roleChip;
    const searchMatch =
      normalizedQuery.length === 0
        ? true
        : `${member.fullName} ${member.phoneNumber} ${member.role}`
            .toLowerCase()
            .includes(normalizedQuery);

    return tabMatch && roleMatch && searchMatch;
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

export function getApprovableMembers(members: MemberRecord[]): MemberRecord[] {
  return members.filter(canApproveMember);
}

export function getSuspendableMembers(
  allMembers: MemberRecord[],
  visibleMembers: MemberRecord[],
): MemberRecord[] {
  return visibleMembers.filter((member) => canSuspendMember(allMembers, member));
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

export function getReactivatableMembers(
  members: MemberRecord[],
): MemberRecord[] {
  return members.filter(canReactivateMember);
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

export function getRoleChangeableMembers(
  allMembers: MemberRecord[],
  visibleMembers: MemberRecord[],
  nextRole: UserRole,
): MemberRecord[] {
  return visibleMembers.filter((member) =>
    canChangeMemberRole(allMembers, member, nextRole),
  );
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

export function formatMemberAuditTimestamp(value: string | null): string {
  if (!value) {
    return 'Not recorded';
  }

  const [datePart] = value.split('T');

  return datePart && datePart.length > 0 ? datePart : 'Not recorded';
}

export function describeMemberApproval(member: MemberRecord): string {
  if (member.status === 'pending_approval') {
    return 'Pending approval';
  }

  if (member.status === 'profile_incomplete') {
    return 'Profile incomplete';
  }

  return formatMemberAuditTimestamp(member.approvedAt);
}

export function describeMemberLifecycle(member: MemberRecord): string {
  const created = formatMemberAuditTimestamp(member.createdAt);
  const approved = formatMemberAuditTimestamp(member.approvedAt);
  const updated = formatMemberAuditTimestamp(member.updatedAt);

  switch (member.status) {
    case 'profile_incomplete':
      return `Started on ${created} and still waiting for profile completion.`;
    case 'pending_approval':
      return `Created on ${created} and still waiting for admin approval.`;
    case 'active':
      return member.approvedAt
        ? `Approved on ${approved} and currently active. Last member update ${updated}.`
        : `Currently active. Last member update ${updated}.`;
    case 'suspended':
      return `Approved on ${approved} and currently suspended. Last member update ${updated}.`;
    case 'deactivated':
      return `Approved on ${approved} and later deactivated. Last member update ${updated}.`;
  }
}
