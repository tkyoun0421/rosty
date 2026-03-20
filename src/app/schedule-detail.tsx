import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { ScheduleDetailScreen } from '@/features/schedules/ui/schedule-detail-screen';

function ScheduleDetailRouteContent() {
  const params = useLocalSearchParams<{ scheduleId?: string | string[] }>();
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const scheduleId =
    typeof params.scheduleId === 'string'
      ? params.scheduleId
      : Array.isArray(params.scheduleId)
        ? params.scheduleId[0] ?? ''
        : '';

  if (!session || session.status !== 'active') {
    return null;
  }

  return (
    <ScheduleDetailScreen
      session={session}
      scheduleId={scheduleId}
      onBackList={() => {
        router.replace(authRoutes.scheduleList);
      }}
      onOpenAvailabilityOverview={
        session.role !== 'employee'
          ? () => {
              router.push(
                `${authRoutes.availabilityOverview}?scheduleId=${encodeURIComponent(
                  scheduleId,
                )}`,
              );
            }
          : undefined
      }
      onOpenAssignmentWorkspace={
        session.role !== 'employee'
          ? () => {
              router.push(
                `${authRoutes.assignmentWorkspace}?scheduleId=${encodeURIComponent(
                  scheduleId,
                )}`,
              );
            }
          : undefined
      }
    />
  );
}

export default function ScheduleDetailRoute() {
  return (
    <GuardedRoute route={authRoutes.scheduleDetail}>
      <ScheduleDetailRouteContent />
    </GuardedRoute>
  );
}
