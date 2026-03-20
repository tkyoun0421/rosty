import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { AvailabilityOverviewScreen } from '@/features/availability/ui/availability-overview-screen';

function AvailabilityOverviewRouteContent() {
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
    <AvailabilityOverviewScreen
      session={session}
      scheduleId={scheduleId}
      onBackDetail={() => {
        router.replace(
          `${authRoutes.scheduleDetail}?scheduleId=${encodeURIComponent(scheduleId)}`,
        );
      }}
      onOpenWorkspace={() => {
        router.push(
          `${authRoutes.assignmentWorkspace}?scheduleId=${encodeURIComponent(
            scheduleId,
          )}`,
        );
      }}
    />
  );
}

export default function AvailabilityOverviewRoute() {
  return (
    <GuardedRoute route={authRoutes.availabilityOverview}>
      <AvailabilityOverviewRouteContent />
    </GuardedRoute>
  );
}
