import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { ManagerHomeScreen } from '@/features/home/ui/home-screen';

function ManagerHomeRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role === 'employee') {
    return null;
  }

  return (
    <ManagerHomeScreen
      session={session}
      onOpenMembers={
        session.role === 'admin'
          ? () => {
              router.push(authRoutes.members);
            }
          : undefined
      }
    />
  );
}

export default function ManagerHomeRoute() {
  return (
    <GuardedRoute route={authRoutes.managerHome}>
      <ManagerHomeRouteContent />
    </GuardedRoute>
  );
}
