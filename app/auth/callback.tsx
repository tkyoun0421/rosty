import * as WebBrowser from 'expo-web-browser';

import { AuthLoadingScreen } from '@/features/auth/ui/auth-screens';

WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackRoute() {
  return (
    <AuthLoadingScreen
      title="Completing sign-in"
      body="Returning to Rosty and finishing the secure Supabase session exchange."
    />
  );
}
