import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { NotificationsScreen } from '@/features/notifications/ui/notifications-screen';

function NotificationsRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active') {
    return null;
  }

  return (
    <NotificationsScreen
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

export default function NotificationsRoute() {
  return (
    <GuardedRoute route={authRoutes.notifications}>
      <NotificationsRouteContent />
    </GuardedRoute>
  );
}
