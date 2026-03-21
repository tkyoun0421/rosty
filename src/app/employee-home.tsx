import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { EmployeeHomeScreen } from '@/features/home/ui/home-screen';

function EmployeeHomeRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role !== 'employee') {
    return null;
  }

  return (
    <EmployeeHomeScreen
      session={session}
      onOpenGlobalSearch={() => {
        router.push(authRoutes.globalSearch);
      }}
      onOpenNotifications={() => {
        router.push(authRoutes.notifications);
      }}
      onOpenScheduleList={() => {
        router.push(authRoutes.scheduleList);
      }}
      onOpenMyAssignments={() => {
        router.push(authRoutes.myAssignments);
      }}
      onOpenMyPayroll={() => {
        router.push(authRoutes.myPayroll);
      }}
    />
  );
}

export default function EmployeeHomeRoute() {
  return (
    <GuardedRoute route={authRoutes.employeeHome}>
      <EmployeeHomeRouteContent />
    </GuardedRoute>
  );
}
