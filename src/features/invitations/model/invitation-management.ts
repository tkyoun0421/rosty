import type { UserRole } from '@/features/auth/model/auth-types';

export type InvitationLinkState =
  | 'active'
  | 'disabled'
  | 'expired'
  | 'consumed';

export type InvitationLinkRecord = {
  id: string;
  token: string;
  targetRole: UserRole;
  createdBy: string;
  expiresAt: string;
  consumedAt: string | null;
  disabledAt: string | null;
  createdAt: string;
};

export const INVITATION_EXPIRY_DAYS = 7;

const invitationLifetimeMs = INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export function getInvitationExpiryDate(now: Date = new Date()): Date {
  return new Date(now.getTime() + invitationLifetimeMs);
}

export function createInvitationToken(now: Date = new Date()): string {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID().split('-').join('');
  }

  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  return `${now.getTime().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

export function getInvitationLinkState(
  invitation: InvitationLinkRecord,
  now: Date = new Date(),
): InvitationLinkState {
  if (invitation.consumedAt) {
    return 'consumed';
  }

  if (invitation.disabledAt) {
    return 'disabled';
  }

  if (new Date(invitation.expiresAt).getTime() <= now.getTime()) {
    return 'expired';
  }

  return 'active';
}

export function canDisableInvitation(
  invitation: InvitationLinkRecord,
  now: Date = new Date(),
): boolean {
  return getInvitationLinkState(invitation, now) === 'active';
}

export function canReissueInvitation(
  invitation: InvitationLinkRecord,
  now: Date = new Date(),
): boolean {
  return getInvitationLinkState(invitation, now) === 'active';
}

export function getActiveInvitationLinks(
  invitations: InvitationLinkRecord[],
  now: Date = new Date(),
): InvitationLinkRecord[] {
  return invitations.filter(
    (invitation) => getInvitationLinkState(invitation, now) === 'active',
  );
}

export function getHistoricalInvitationLinks(
  invitations: InvitationLinkRecord[],
  now: Date = new Date(),
): InvitationLinkRecord[] {
  return invitations.filter(
    (invitation) => getInvitationLinkState(invitation, now) !== 'active',
  );
}

export function getInvitationCounts(
  invitations: InvitationLinkRecord[],
  now: Date = new Date(),
): Record<InvitationLinkState, number> {
  const counts: Record<InvitationLinkState, number> = {
    active: 0,
    disabled: 0,
    expired: 0,
    consumed: 0,
  };

  invitations.forEach((invitation) => {
    counts[getInvitationLinkState(invitation, now)] += 1;
  });

  return counts;
}
