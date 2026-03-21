import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { ScheduleEditScreen } from '@/features/schedules/ui/schedule-edit-screen';

function ScheduleEditRouteContent() {
  const params = useLocalSearchParams<{ scheduleId?: string | string[] }>();
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const scheduleId =
    typeof params.scheduleId === 'string'
      ? params.scheduleId
      : Array.isArray(params.scheduleId)
        ? params.scheduleId[0] ?? ''
        : null;

  if (!session || session.status !== 'active' || session.role === 'employee') {
    return null;
  }

  return (
    <ScheduleEditScreen
      session={session}
      scheduleId={scheduleId}
      onBackSchedule={(nextScheduleId) => {
        const targetScheduleId = nextScheduleId ?? scheduleId;

        if (targetScheduleId) {
          router.replace(
            `${authRoutes.scheduleDetail}?scheduleId=${encodeURIComponent(
              targetScheduleId,
            )}`,
          );
          return;
        }

        router.replace(authRoutes.scheduleList);
      }}
    />
  );
}

export default function ScheduleEditRoute() {
  return (
    <GuardedRoute route={authRoutes.scheduleEdit}>
      <ScheduleEditRouteContent />
    </GuardedRoute>
  );
}
