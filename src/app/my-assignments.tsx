import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { MyAssignmentsScreen } from '@/features/assignments/ui/my-assignments-screen';

function MyAssignmentsRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role !== 'employee') {
    return null;
  }

  return (
    <MyAssignmentsScreen
      session={session}
      onBackHome={() => {
        router.replace(authRoutes.employeeHome);
      }}
      onOpenSchedule={(scheduleId) => {
        router.push(
          `${authRoutes.assignmentDetail}?scheduleId=${encodeURIComponent(scheduleId)}`,
        );
      }}
    />
  );
}

export default function MyAssignmentsRoute() {
  return (
    <GuardedRoute route={authRoutes.myAssignments}>
      <MyAssignmentsRouteContent />
    </GuardedRoute>
  );
}
