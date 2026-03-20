import {
  createGoogleOAuthRedirectUrl,
  extractInvitationToken,
  extractOAuthCode,
  nativeAuthCallbackUrl,
} from '@/features/auth/lib/google-oauth';

describe('google oauth URL helpers', () => {
  it('uses the stable native callback base', () => {
    expect(nativeAuthCallbackUrl).toBe('rosty://auth/callback');
  });

  it('reads the auth code from the query string', () => {
    expect(
      extractOAuthCode('rosty://auth/callback?code=query-code&state=test'),
    ).toBe('query-code');
  });

  it('reads the auth code from the hash fragment when present', () => {
    expect(
      extractOAuthCode('rosty://auth/callback#code=hash-code&state=test'),
    ).toBe('hash-code');
  });

  it('reads the invitation token from either query or hash params', () => {
    expect(
      extractInvitationToken('rosty://auth/callback?invite=query-invite'),
    ).toBe('query-invite');
    expect(
      extractInvitationToken('rosty://auth/callback#invite=hash-invite'),
    ).toBe('hash-invite');
  });

  it('preserves the invitation token when building a redirect URL', () => {
    expect(createGoogleOAuthRedirectUrl('invite-token')).toContain(
      'invite=invite-token',
    );
  });
});
