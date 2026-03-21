import {
  createFallbackAuthSession,
  mergeAuthProfile,
} from '@/features/auth/model/auth-session';

describe('fallback auth session', () => {
  it('creates a safe employee profile-incomplete session from user metadata', () => {
    expect(
      createFallbackAuthSession({
        id: 'user-1',
        email: 'mina.staff@rosty.app',
        user_metadata: {
          full_name: 'Mina Staff',
        },
      } as never),
    ).toEqual({
      userId: 'user-1',
      displayName: 'Mina Staff',
      role: 'employee',
      status: 'profile_incomplete',
    });
  });

  it('falls back to the email local-part when metadata is empty', () => {
    expect(
      createFallbackAuthSession({
        id: 'user-2',
        email: 'ops.manager@rosty.app',
        user_metadata: {},
      } as never).displayName,
    ).toBe('ops.manager');
  });
});

describe('profile merge', () => {
  it('uses valid profile fields to upgrade the fallback session', () => {
    const baseSession = createFallbackAuthSession({
      id: 'user-3',
      email: 'staff@rosty.app',
      user_metadata: {},
    } as never);

    expect(
      mergeAuthProfile(baseSession, {
        fullName: 'Joon Manager',
        role: 'manager',
        status: 'active',
      }),
    ).toEqual({
      userId: 'user-3',
      displayName: 'Joon Manager',
      role: 'manager',
      status: 'active',
    });
  });

  it('accepts deactivated as a valid profile status', () => {
    const baseSession = createFallbackAuthSession({
      id: 'user-5',
      email: 'blocked@rosty.app',
      user_metadata: {},
    } as never);

    expect(
      mergeAuthProfile(baseSession, {
        fullName: 'Blocked User',
        role: 'employee',
        status: 'deactivated',
      }),
    ).toEqual({
      userId: 'user-5',
      displayName: 'Blocked User',
      role: 'employee',
      status: 'deactivated',
    });
  });

  it('ignores invalid profile role and status values', () => {
    const baseSession = createFallbackAuthSession({
      id: 'user-4',
      email: 'staff@rosty.app',
      user_metadata: {
        name: 'Fallback User',
      },
    } as never);

    expect(
      mergeAuthProfile(baseSession, {
        fullName: '',
        role: 'owner' as never,
        status: 'enabled' as never,
      }),
    ).toEqual(baseSession);
  });
});
