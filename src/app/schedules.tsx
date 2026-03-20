import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { ScheduleListScreen } from '@/features/schedules/ui/schedule-list-screen';

function ScheduleListRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active') {
    return null;
  }

  return (
    <ScheduleListScreen
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

export default function SchedulesRoute() {
  return (
    <GuardedRoute route={authRoutes.scheduleList}>
      <ScheduleListRouteContent />
    </GuardedRoute>
  );
}
