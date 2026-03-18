import type { PropsWithChildren } from 'react';

import { Redirect } from 'expo-router';

import { authRoutes, canAccessRoute, resolveEntryRoute, type AppRoute } from '@/features/auth/model/auth-rules';
import { useAuthStore } from '@/features/auth/model/auth-store';

import { AuthLoadingScreen } from '@/features/auth/ui/auth-screens';

export { authRoutes };

export function EntryRoute() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);

  if (!isHydrated) {
    return <AuthLoadingScreen title="Restoring session" body="Checking the stored sign-in state before routing." />;
  }

  return <Redirect href={resolveEntryRoute(session)} />;
}

export function GuardedRoute({ route, children }: PropsWithChildren<{ route: AppRoute }>) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);

  if (!isHydrated) {
    return <AuthLoadingScreen title="Preparing screen" body="Confirming which screen this session can open." />;
  }

  if (!canAccessRoute(session, route)) {
    return <Redirect href={resolveEntryRoute(session)} />;
  }

  return <>{children}</>;
}
