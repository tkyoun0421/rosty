import {
  DEACTIVATED_ACCOUNT_MESSAGE,
  normalizeResolvedAuthState,
} from '@/features/auth/model/auth-store';

describe('normalizeResolvedAuthState', () => {
  it('keeps active sessions intact', () => {
    expect(
      normalizeResolvedAuthState({
        session: {
          userId: 'user-1',
          displayName: 'Mina Staff',
          role: 'employee',
          status: 'active',
        },
        authSource: 'supabase',
      }),
    ).toEqual({
      session: {
        userId: 'user-1',
        displayName: 'Mina Staff',
        role: 'employee',
        status: 'active',
      },
      authSource: 'supabase',
      errorMessage: null,
    });
  });

  it('drops deactivated sessions back to login state with a blocked message', () => {
    expect(
      normalizeResolvedAuthState({
        session: {
          userId: 'user-2',
          displayName: 'Blocked User',
          role: 'employee',
          status: 'deactivated',
        },
        authSource: 'supabase',
      }),
    ).toEqual({
      session: null,
      authSource: null,
      errorMessage: DEACTIVATED_ACCOUNT_MESSAGE,
    });
  });
});
