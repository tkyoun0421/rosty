import {
  INVITATION_EXPIRY_DAYS,
  canDisableInvitation,
  canReissueInvitation,
  getActiveInvitationLinks,
  getHistoricalInvitationLinks,
  getInvitationCounts,
  getInvitationExpiryDate,
  getInvitationLinkState,
  type InvitationLinkRecord,
} from '@/features/invitations/model/invitation-management';

const now = new Date('2026-03-19T00:00:00.000Z');

const invitationSeed: InvitationLinkRecord[] = [
  {
    id: 'invite-active',
    token: 'active-token',
    targetRole: 'employee',
    createdBy: 'admin-1',
    expiresAt: '2026-03-26T00:00:00.000Z',
    consumedAt: null,
    disabledAt: null,
    createdAt: '2026-03-19T00:00:00.000Z',
  },
  {
    id: 'invite-disabled',
    token: 'disabled-token',
    targetRole: 'employee',
    createdBy: 'admin-1',
    expiresAt: '2026-03-26T00:00:00.000Z',
    consumedAt: null,
    disabledAt: '2026-03-19T01:00:00.000Z',
    createdAt: '2026-03-19T00:10:00.000Z',
  },
  {
    id: 'invite-expired',
    token: 'expired-token',
    targetRole: 'employee',
    createdBy: 'admin-1',
    expiresAt: '2026-03-18T23:59:59.000Z',
    consumedAt: null,
    disabledAt: null,
    createdAt: '2026-03-11T00:00:00.000Z',
  },
  {
    id: 'invite-consumed',
    token: 'consumed-token',
    targetRole: 'employee',
    createdBy: 'admin-1',
    expiresAt: '2026-03-26T00:00:00.000Z',
    consumedAt: '2026-03-19T02:00:00.000Z',
    disabledAt: null,
    createdAt: '2026-03-18T22:00:00.000Z',
  },
];

describe('invitation state derivation', () => {
  it('classifies active, disabled, expired, and consumed links', () => {
    expect(getInvitationLinkState(invitationSeed[0], now)).toBe('active');
    expect(getInvitationLinkState(invitationSeed[1], now)).toBe('disabled');
    expect(getInvitationLinkState(invitationSeed[2], now)).toBe('expired');
    expect(getInvitationLinkState(invitationSeed[3], now)).toBe('consumed');
  });

  it('counts active and historical invitation groups', () => {
    expect(getActiveInvitationLinks(invitationSeed, now)).toHaveLength(1);
    expect(getHistoricalInvitationLinks(invitationSeed, now)).toHaveLength(3);
    expect(getInvitationCounts(invitationSeed, now)).toEqual({
      active: 1,
      disabled: 1,
      expired: 1,
      consumed: 1,
    });
  });
});

describe('invitation actions', () => {
  it('allows disable and reissue only for active links', () => {
    expect(canDisableInvitation(invitationSeed[0], now)).toBe(true);
    expect(canReissueInvitation(invitationSeed[0], now)).toBe(true);
    expect(canDisableInvitation(invitationSeed[2], now)).toBe(false);
    expect(canReissueInvitation(invitationSeed[3], now)).toBe(false);
  });

  it('creates the locked 7 day expiry window', () => {
    expect(getInvitationExpiryDate(now).toISOString()).toBe(
      '2026-03-26T00:00:00.000Z',
    );
    expect(INVITATION_EXPIRY_DAYS).toBe(7);
  });
});
