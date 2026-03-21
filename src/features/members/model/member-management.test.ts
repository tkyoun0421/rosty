import {
  canApproveMember,
  canChangeMemberRole,
  canReactivateMember,
  canSuspendMember,
  countActiveAdmins,
  getDeactivatedMembers,
  getLastAdminProtectionMessage,
  isLastActiveAdmin,
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
    approvedAt: '2026-03-19T00:00:00.000Z',
  },
  {
    id: 'employee-1',
    fullName: 'Employee One',
    phoneNumber: '01000000000',
    gender: 'female',
    role: 'employee',
    status: 'pending_approval',
    approvedAt: null,
  },
  {
    id: 'employee-2',
    fullName: 'Employee Two',
    phoneNumber: '01099999999',
    gender: 'male',
    role: 'employee',
    status: 'suspended',
    approvedAt: '2026-03-15T00:00:00.000Z',
  },
  {
    id: 'employee-3',
    fullName: 'Employee Three',
    phoneNumber: '01077777777',
    gender: 'female',
    role: 'employee',
    status: 'deactivated',
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
  });

  it('allows reactivating suspended users', () => {
    expect(canReactivateMember(membersSeed[2])).toBe(true);
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
});
