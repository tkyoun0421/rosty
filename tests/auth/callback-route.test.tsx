import { act, render, waitFor } from '@testing-library/react-native';

import AuthCallbackRoute from '@/app/auth/callback';
import { useAuthStore } from '@/features/auth/model/auth-store';

const mockRedirect = jest.fn(({ href }: { href: string }) => href);
const mockUseURL = jest.fn<string | null, []>();

jest.mock('expo-router', () => {
  return {
    Redirect: (props: { href: string }) => {
      mockRedirect(props);
      return null;
    },
  };
});

jest.mock('expo-linking', () => {
  return {
    useURL: () => mockUseURL(),
  };
});

describe('auth callback route', () => {
  afterEach(async () => {
    await act(async () => {
      useAuthStore.setState({
        isHydrated: false,
        isAuthenticating: false,
        session: null,
        authSource: null,
        pendingInvitationToken: null,
        processingOAuthCode: null,
        handledOAuthCode: null,
        errorMessage: null,
      });
    });
    mockRedirect.mockReset();
    mockUseURL.mockReset();
  });

  it('processes the callback URL once when the route mounts', async () => {
    const completeOAuthRedirect = jest.fn(async () => true);

    useAuthStore.setState({
      isHydrated: false,
      isAuthenticating: true,
      session: null,
      authSource: null,
      pendingInvitationToken: null,
      processingOAuthCode: null,
      handledOAuthCode: null,
      errorMessage: null,
      completeOAuthRedirect,
    });
    mockUseURL.mockReturnValue('rosty://auth/callback?code=test-code');

    render(<AuthCallbackRoute />);

    await waitFor(() => {
      expect(completeOAuthRedirect).toHaveBeenCalledWith(
        'rosty://auth/callback?code=test-code',
      );
    });
  });
});
