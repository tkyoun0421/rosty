import { SuspendedScreen } from '@/features/auth/ui/auth-screens';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';

export default function SuspendedRoute() {
  return (
    <GuardedRoute route={authRoutes.suspended}>
      <SuspendedScreen />
    </GuardedRoute>
  );
}
