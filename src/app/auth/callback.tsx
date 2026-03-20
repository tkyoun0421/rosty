import { useEffect, useRef } from 'react';

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Redirect } from 'expo-router';

import { resolveEntryRoute } from '@/features/auth/model/auth-rules';
import { useAuthStore } from '@/features/auth/model/auth-store';
import { AuthLoadingScreen } from '@/features/auth/ui/auth-screens';

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackRoute() {
  const callbackUrl = Linking.useURL();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const session = useAuthStore((state) => state.session);
  const completeOAuthRedirect = useAuthStore(
    (state) => state.completeOAuthRedirect,
  );
  const attemptedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!callbackUrl || attemptedUrlRef.current === callbackUrl) {
      return;
    }

    attemptedUrlRef.current = callbackUrl;
    void completeOAuthRedirect(callbackUrl);
  }, [callbackUrl, completeOAuthRedirect]);

  if (
    callbackUrl &&
    attemptedUrlRef.current === callbackUrl &&
    isHydrated &&
    !isAuthenticating
  ) {
    return <Redirect href={resolveEntryRoute(session)} />;
  }

  return (
    <AuthLoadingScreen
      title="Completing sign-in"
      body="Returning to Rosty and finishing the secure Supabase session exchange."
    />
  );
}
