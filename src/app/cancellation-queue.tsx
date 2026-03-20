import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { CancellationQueueScreen } from '@/features/assignments/ui/cancellation-queue-screen';

function CancellationQueueRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role === 'employee') {
    return null;
  }

  return (
    <CancellationQueueScreen
      session={session}
      onBackHome={() => {
        router.replace(authRoutes.managerHome);
      }}
    />
  );
}

export default function CancellationQueueRoute() {
  return (
    <GuardedRoute route={authRoutes.cancellationQueue}>
      <CancellationQueueRouteContent />
    </GuardedRoute>
  );
}
