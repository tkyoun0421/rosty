import { createDemoSession } from '@/features/auth/model/auth-rules';
import type { InvitationLinkRecord } from '@/features/invitations/model/invitation-management';
import {
  canCompleteEmployeeJoin,
  getInvitationJoinMessage,
  requiresEmployeeInvitation,
  resolveInvitationTokenParam,
} from '@/features/invitations/model/invitation-join';

const now = new Date('2026-03-19T00:00:00.000Z');

const activeInvitation: InvitationLinkRecord = {
  id: 'invite-active',
  token: 'active-token',
  targetRole: 'employee',
  createdBy: 'admin-1',
  expiresAt: '2026-03-26T00:00:00.000Z',
  consumedAt: null,
  disabledAt: null,
  createdAt: '2026-03-19T00:00:00.000Z',
};

const consumedInvitation: InvitationLinkRecord = {
  ...activeInvitation,
  id: 'invite-consumed',
  token: 'consumed-token',
  consumedAt: '2026-03-19T01:00:00.000Z',
};

describe('invitation token helpers', () => {
  it('normalizes route params into a usable invitation token', () => {
    expect(resolveInvitationTokenParam(' invite-token ')).toBe('invite-token');
    expect(resolveInvitationTokenParam(['invite-token', 'other'])).toBe(
      'invite-token',
    );
    expect(resolveInvitationTokenParam('   ')).toBeNull();
    expect(resolveInvitationTokenParam(undefined)).toBeNull();
  });
});

describe('employee invitation requirement', () => {
  it('requires an invite token for profile-incomplete employees', () => {
    expect(requiresEmployeeInvitation(createDemoSession('employee-new'))).toBe(
      true,
    );
    expect(requiresEmployeeInvitation(createDemoSession('employee-pending'))).toBe(
      false,
    );
    expect(requiresEmployeeInvitation(createDemoSession('admin-active'))).toBe(
      false,
    );
  });

  it('allows onboarding only when the invite token is active', () => {
    expect(
      canCompleteEmployeeJoin(
        createDemoSession('employee-new'),
        'active-token',
        activeInvitation,
        now,
      ),
    ).toBe(true);
    expect(
      canCompleteEmployeeJoin(createDemoSession('employee-new'), null, null, now),
    ).toBe(false);
    expect(
      canCompleteEmployeeJoin(
        createDemoSession('employee-new'),
        'consumed-token',
        consumedInvitation,
        now,
      ),
    ).toBe(false);
    expect(
      canCompleteEmployeeJoin(
        createDemoSession('employee-active'),
        null,
        null,
        now,
      ),
    ).toBe(true);
  });

  it('returns a clear blocking message for missing or used invites', () => {
    expect(getInvitationJoinMessage(null, null, now)).toBe(
      'Open the employee invitation link again to continue profile setup.',
    );
    expect(getInvitationJoinMessage('missing-token', null, now)).toBe(
      'This invitation link could not be found.',
    );
    expect(
      getInvitationJoinMessage('consumed-token', consumedInvitation, now),
    ).toBe('This invitation link has already been used.');
  });
});
