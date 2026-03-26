import {
  canApproveMember,
  canChangeMemberRole,
  canReactivateMember,
  canSuspendMember,
  countActiveAdmins,
  describeMemberApproval,
  describeMemberLifecycle,
  filterMembersList,
  formatMemberAuditTimestamp,
  getApprovableMembers,
  getDeactivatedMembers,
  getLastAdminProtectionMessage,
  getReactivatableMembers,
  getRoleChangeableMembers,
  getSuspendableMembers,
  isLastActiveAdmin,
  summarizeMemberNames,
  summarizeMemberRoleMix,
  type MemberRecord,
} from '@/features/members/model/member-management';

const membersSeed: MemberRecord[] = [
  {
    id: 'admin-1',
    fullName: 'Admin One',
    phoneNumber: '01012345678',
    gender: 'unspecified',
    role: 'admin',
    status: 'active',
    createdAt: '2026-03-18T00:00:00.000Z',
    updatedAt: '2026-03-21T00:00:00.000Z',
    approvedAt: '2026-03-19T00:00:00.000Z',
  },
  {
    id: 'employee-1',
    fullName: 'Employee One',
    phoneNumber: '01000000000',
    gender: 'female',
    role: 'employee',
    status: 'pending_approval',
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-20T00:00:00.000Z',
    approvedAt: null,
  },
  {
    id: 'employee-2',
    fullName: 'Employee Two',
    phoneNumber: '01099999999',
    gender: 'male',
    role: 'employee',
    status: 'suspended',
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-22T00:00:00.000Z',
    approvedAt: '2026-03-15T00:00:00.000Z',
  },
  {
    id: 'employee-3',
    fullName: 'Employee Three',
    phoneNumber: '01077777777',
    gender: 'female',
    role: 'employee',
    status: 'deactivated',
    createdAt: '2026-03-08T00:00:00.000Z',
    updatedAt: '2026-03-23T00:00:00.000Z',
    approvedAt: '2026-03-10T00:00:00.000Z',
  },
];

describe('member management protections', () => {
  it('counts active admins correctly', () => {
    expect(countActiveAdmins(membersSeed)).toBe(1);
  });

  it('marks the only active admin as protected', () => {
    expect(isLastActiveAdmin(membersSeed, 'admin-1')).toBe(true);
    expect(getLastAdminProtectionMessage(membersSeed, membersSeed[0])).toBe(
      'The last active admin cannot be suspended or downgraded.',
    );
  });

  it('blocks suspending or downgrading the last active admin', () => {
    expect(canSuspendMember(membersSeed, membersSeed[0])).toBe(false);
    expect(canChangeMemberRole(membersSeed, membersSeed[0], 'manager')).toBe(
      false,
    );
  });
});

describe('member workflow actions', () => {
  it('allows approving pending users', () => {
    expect(canApproveMember(membersSeed[1])).toBe(true);
    expect(getApprovableMembers(membersSeed)).toHaveLength(1);
  });

  it('allows reactivating suspended users', () => {
    expect(canReactivateMember(membersSeed[2])).toBe(true);
    expect(getReactivatableMembers(membersSeed)).toHaveLength(1);
  });

  it('allows changing a non-admin role', () => {
    expect(canChangeMemberRole(membersSeed, membersSeed[1], 'manager')).toBe(
      true,
    );
  });

  it('groups deactivated members separately and keeps them read-only', () => {
    expect(getDeactivatedMembers(membersSeed)).toHaveLength(1);
    expect(canChangeMemberRole(membersSeed, membersSeed[3], 'manager')).toBe(
      false,
    );
  });

  it('filters members by top tab and role chip', () => {
    expect(
      filterMembersList({
        members: membersSeed,
        tab: 'pending_approval',
        roleChip: 'all',
      }),
    ).toHaveLength(1);
    expect(
      filterMembersList({
        members: membersSeed,
        tab: 'all',
        roleChip: 'employee',
      }),
    ).toHaveLength(3);
    expect(
      filterMembersList({
        members: membersSeed,
        tab: 'deactivated',
        roleChip: 'manager',
      }),
    ).toHaveLength(0);
    expect(
      filterMembersList({
        members: membersSeed,
        tab: 'all',
        roleChip: 'all',
        query: '9999',
      }),
    ).toHaveLength(1);
  });

  it('formats audit timestamps and approval state for member cards', () => {
    expect(formatMemberAuditTimestamp(membersSeed[0].createdAt)).toBe(
      '2026-03-18',
    );
    expect(describeMemberApproval(membersSeed[1])).toBe('Pending approval');
    expect(describeMemberApproval(membersSeed[2])).toBe('2026-03-15');
    expect(describeMemberLifecycle(membersSeed[2])).toContain('currently suspended');
  });

  it('returns only currently suspendable members for bulk admin actions', () => {
    expect(getSuspendableMembers(membersSeed, membersSeed)).toHaveLength(1);
    expect(
      getSuspendableMembers(membersSeed, membersSeed).map((member) => member.id),
    ).toEqual(['employee-1']);
  });

  it('returns only currently role-changeable members for a bulk role update', () => {
    expect(
      getRoleChangeableMembers(membersSeed, membersSeed, 'manager').map(
        (member) => member.id,
      ),
    ).toEqual(['employee-1', 'employee-2']);
    expect(
      getRoleChangeableMembers(membersSeed, membersSeed, 'admin').map(
        (member) => member.id,
      ),
    ).toEqual(['employee-1', 'employee-2']);
  });

  it('summarizes role mix and member names for bulk action previews', () => {
    expect(summarizeMemberRoleMix(membersSeed)).toBe(
      'employee 3, admin 1',
    );
    expect(summarizeMemberNames(membersSeed, 2)).toBe(
      'Admin One, Employee One +2 more',
    );
  });
});
