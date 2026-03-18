import 'react-native-url-polyfill/auto';

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabaseClient } from '@/shared/lib/supabase/client';

export const authCallbackPath = 'auth/callback';

export type GoogleOAuthResult =
  | { type: 'success'; url: string }
  | { type: 'cancel'; message: string }
  | { type: 'dismiss'; message: string }
  | { type: 'error'; message: string };

export function createGoogleOAuthRedirectUrl(): string {
  return Linking.createURL(authCallbackPath);
}

export function extractOAuthCode(url: string): string | null {
  try {
    return new URL(url).searchParams.get('code');
  } catch {
    return null;
  }
}

export async function startGoogleOAuth(): Promise<GoogleOAuthResult> {
  if (!supabaseClient) {
    return {
      type: 'error',
      message: 'Supabase auth is not configured for this build.',
    };
  }

  const redirectTo = createGoogleOAuthRedirectUrl();
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
