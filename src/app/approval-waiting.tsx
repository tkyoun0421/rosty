import { ApprovalWaitingScreen } from '@/features/auth/ui/auth-screens';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';

export default function ApprovalWaitingRoute() {
  return (
    <GuardedRoute route={authRoutes.approvalWaiting}>
      <ApprovalWaitingScreen />
    </GuardedRoute>
  );
}
