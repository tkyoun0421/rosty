import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { AssignmentWorkspaceScreen } from '@/features/assignments/ui/assignment-workspace-screen';

function AssignmentWorkspaceRouteContent() {
  const params = useLocalSearchParams<{ scheduleId?: string | string[] }>();
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const scheduleId =
    typeof params.scheduleId === 'string'
      ? params.scheduleId
      : Array.isArray(params.scheduleId)
        ? params.scheduleId[0] ?? ''
        : '';

  if (!session || session.status !== 'active' || session.role === 'employee') {
    return null;
  }

  return (
    <AssignmentWorkspaceScreen
      session={session}
      scheduleId={scheduleId}
      onBackDetail={() => {
        router.replace(
          `${authRoutes.scheduleDetail}?scheduleId=${encodeURIComponent(scheduleId)}`,
        );
      }}
    />
  );
}

export default function AssignmentWorkspaceRoute() {
  return (
    <GuardedRoute route={authRoutes.assignmentWorkspace}>
      <AssignmentWorkspaceRouteContent />
    </GuardedRoute>
  );
}
