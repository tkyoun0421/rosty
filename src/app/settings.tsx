import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { SettingsScreen } from '@/features/settings/ui/settings-screen';

function SettingsRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active') {
    return null;
  }

  return (
    <SettingsScreen
      session={session}
      onBackHome={() => {
        router.replace(
          session.role === 'employee'
            ? authRoutes.employeeHome
            : authRoutes.managerHome,
        );
      }}
    />
  );
}

export default function SettingsRoute() {
  return (
    <GuardedRoute route={authRoutes.settings}>
      <SettingsRouteContent />
    </GuardedRoute>
  );
}
