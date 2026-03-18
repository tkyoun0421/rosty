import type { User } from '@supabase/supabase-js';

import {
  authProfileQueryKey,
  fetchAuthProfile,
  type AuthProfile,
} from '@/features/auth/api/fetch-auth-profile';
import type {
  AuthSession,
  UserRole,
  UserStatus,
} from '@/features/auth/model/auth-types';
import { queryClient } from '@/shared/lib/react-query/query-client';

type AuthUserLike = Pick<User, 'id' | 'email' | 'user_metadata'>;

const userRoles: UserRole[] = ['employee', 'manager', 'admin'];
const userStatuses: UserStatus[] = [
  'profile_incomplete',
  'pending_approval',
  'active',
  'suspended',
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function resolveNameFromMetadata(user: AuthUserLike): string | null {
  const candidates = [
    user.user_metadata?.full_name,
    user.user_metadata?.name,
    user.user_metadata?.display_name,
  ];

  for (const candidate of candidates) {
    if (isNonEmptyString(candidate)) {
      return candidate.trim();
    }
  }

  return null;
}

function resolveNameFromEmail(user: AuthUserLike): string | null {
  if (!isNonEmptyString(user.email)) {
    return null;
  }

  const localPart = user.email.split('@')[0]?.trim();

  return localPart && localPart.length > 0 ? localPart : null;
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && userRoles.includes(value as UserRole);
}

export function isUserStatus(value: unknown): value is UserStatus {
  return (
    typeof value === 'string' && userStatuses.includes(value as UserStatus)
  );
}

export function createFallbackAuthSession(user: AuthUserLike): AuthSession {
  return {
    userId: user.id,
    displayName:
      resolveNameFromMetadata(user) ??
      resolveNameFromEmail(user) ??
      'Rosty User',
    role: 'employee',
    status: 'profile_incomplete',
  };
}

export function mergeAuthProfile(
  baseSession: AuthSession,
  profile: AuthProfile | null,
): AuthSession {
  if (!profile) {
    return baseSession;
  }

  return {
    ...baseSession,
    displayName: isNonEmptyString(profile.fullName)
      ? profile.fullName.trim()
      : baseSession.displayName,
    role: isUserRole(profile.role) ? profile.role : baseSession.role,
    status: isUserStatus(profile.status) ? profile.status : baseSession.status,
  };
}

export async function resolveSupabaseAuthSession(
  user: AuthUserLike,
): Promise<AuthSession> {
  const fallbackSession = createFallbackAuthSession(user);
  const profile = await queryClient.fetchQuery({
    queryKey: authProfileQueryKey(user.id),
    queryFn: () => fetchAuthProfile(user.id),
    staleTime: 60_000,
  });

  return mergeAuthProfile(fallbackSession, profile);
}
