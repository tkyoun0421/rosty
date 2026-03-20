import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { AssignmentDetailScreen } from '@/features/assignments/ui/assignment-detail-screen';

function AssignmentDetailRouteContent() {
  const params = useLocalSearchParams<{ scheduleId?: string | string[] }>();
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const scheduleId =
    typeof params.scheduleId === 'string'
      ? params.scheduleId
      : Array.isArray(params.scheduleId)
        ? params.scheduleId[0] ?? ''
        : '';

  if (!session || session.status !== 'active' || session.role !== 'employee') {
    return null;
  }

  return (
    <AssignmentDetailScreen
      session={session}
      scheduleId={scheduleId}
      onBackAssignments={() => {
        router.replace(authRoutes.myAssignments);
      }}
    />
  );
}

export default function AssignmentDetailRoute() {
  return (
    <GuardedRoute route={authRoutes.assignmentDetail}>
      <AssignmentDetailRouteContent />
    </GuardedRoute>
  );
}
