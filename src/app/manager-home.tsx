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
      onOpenGlobalSearch={() => {
        router.push(authRoutes.globalSearch);
      }}
      onOpenNotifications={() => {
        router.push(authRoutes.notifications);
      }}
      onOpenScheduleEdit={() => {
        router.push(authRoutes.scheduleEdit);
      }}
      onOpenScheduleList={() => {
        router.push(authRoutes.scheduleList);
      }}
      onOpenCancellationQueue={() => {
        router.push(authRoutes.cancellationQueue);
      }}
      onOpenTeamPayroll={() => {
        router.push(authRoutes.teamPayroll);
      }}
      onOpenMembers={
        session.role === 'admin'
          ? () => {
              router.push(authRoutes.members);
            }
          : undefined
      }
      onOpenPayPolicy={
        session.role === 'admin'
          ? () => {
              router.push(authRoutes.payPolicy);
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
