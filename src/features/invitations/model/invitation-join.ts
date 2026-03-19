import type { AuthSession } from '@/features/auth/model/auth-types';
import {
  getInvitationLinkState,
  type InvitationLinkRecord,
} from '@/features/invitations/model/invitation-management';

export const invitationTokenParam = 'invite';

export function resolveInvitationTokenParam(
  value: string | string[] | undefined,
): string | null {
  const token = Array.isArray(value) ? value[0] : value;

  if (typeof token !== 'string') {
    return null;
  }

  const trimmed = token.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function requiresEmployeeInvitation(
  session: AuthSession | null,
): boolean {
  return session?.status === 'profile_incomplete' && session.role === 'employee';
}

export function canCompleteEmployeeJoin(
  session: AuthSession | null,
  invitationToken: string | null,
  invitation: InvitationLinkRecord | null,
  now: Date = new Date(),
): boolean {
  if (!requiresEmployeeInvitation(session)) {
    return true;
  }

  if (!invitationToken || !invitation) {
    return false;
  }

  return getInvitationLinkState(invitation, now) === 'active';
}

export function getInvitationJoinMessage(
  invitationToken: string | null,
  invitation: InvitationLinkRecord | null,
  now: Date = new Date(),
): string {
  if (!invitationToken) {
    return 'Open the employee invitation link again to continue profile setup.';
  }

  if (!invitation) {
    return 'This invitation link could not be found.';
  }

  switch (getInvitationLinkState(invitation, now)) {
    case 'active':
      return 'This invitation link is valid for employee onboarding.';
    case 'consumed':
      return 'This invitation link has already been used.';
    case 'expired':
      return 'This invitation link has expired.';
    case 'disabled':
      return 'This invitation link has been disabled.';
  }
}
