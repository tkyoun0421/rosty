import 'react-native-url-polyfill/auto';

import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { invitationTokenParam } from '@/features/invitations/model/invitation-join';
import { supabaseClient } from '@/shared/lib/supabase/client';

export const authCallbackPath = 'auth/callback';
export const nativeAuthCallbackUrl = `rosty://${authCallbackPath}`;

export type GoogleOAuthResult =
  | { type: 'success'; url: string }
  | { type: 'cancel'; message: string }
  | { type: 'dismiss'; message: string }
  | { type: 'error'; message: string };

function appendInvitationTokenToRedirectUrl(
  redirectUrl: string,
  invitationToken?: string | null,
): string {
  if (!invitationToken) {
    return redirectUrl;
  }

  try {
    const parsed = new URL(redirectUrl);
    parsed.searchParams.set(invitationTokenParam, invitationToken);
    return parsed.toString();
  } catch {
    const separator = redirectUrl.includes('?') ? '&' : '?';
    return `${redirectUrl}${separator}${invitationTokenParam}=${encodeURIComponent(invitationToken)}`;
  }
}

export function createGoogleOAuthRedirectUrl(
  invitationToken?: string | null,
): string {
  const redirectUrl =
    Platform.OS === 'web'
      ? Linking.createURL(authCallbackPath)
      : nativeAuthCallbackUrl;

  return appendInvitationTokenToRedirectUrl(redirectUrl, invitationToken);
}

export function extractOAuthCode(url: string): string | null {
  try {
    const parsed = new URL(url);

    return (
      parsed.searchParams.get('code') ??
      new URLSearchParams(parsed.hash.replace(/^#/, '')).get('code')
    );
  } catch {
    return null;
  }
}

export function extractInvitationToken(url: string): string | null {
  try {
    const parsed = new URL(url);

    return (
      parsed.searchParams.get(invitationTokenParam) ??
      new URLSearchParams(parsed.hash.replace(/^#/, '')).get(
        invitationTokenParam,
      )
    );
  } catch {
    return null;
  }
}

export async function startGoogleOAuth(
  invitationToken?: string | null,
): Promise<GoogleOAuthResult> {
  if (!supabaseClient) {
    return {
      type: 'error',
      message: 'Supabase auth is not configured for this build.',
    };
  }

  if (
    Platform.OS !== 'web' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ) {
    return {
      type: 'error',
      message:
        'Real Google sign-in requires a development build or standalone app. Expo Go cannot reopen the custom rosty:// callback.',
    };
  }

  const redirectTo = createGoogleOAuthRedirectUrl(invitationToken);
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error || !data.url) {
    return {
      type: 'error',
      message: error?.message ?? 'Could not start Google sign-in.',
    };
  }

  try {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success' && result.url) {
      return {
        type: 'success',
        url: result.url,
      };
    }

    if (result.type === 'dismiss') {
      return {
        type: 'dismiss',
        message: 'The sign-in window was dismissed before completion.',
      };
    }

    return {
      type: 'cancel',
      message: 'Google sign-in was canceled before completion.',
    };
  } catch (error) {
    return {
      type: 'error',
      message:
        error instanceof Error
          ? error.message
          : 'Google sign-in could not open.',
    };
  }
}
