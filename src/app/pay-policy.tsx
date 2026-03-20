import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { PayPolicyScreen } from '@/features/payroll/ui/pay-policy-screen';

function PayPolicyRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role !== 'admin') {
    return null;
  }

  return (
    <PayPolicyScreen
      session={session}
      onBackHome={() => {
        router.replace(authRoutes.managerHome);
      }}
      onOpenTeamPayroll={() => {
        router.push(authRoutes.teamPayroll);
      }}
      onBackMembers={() => {
        router.replace(authRoutes.members);
      }}
    />
  );
}

export default function PayPolicyRoute() {
  return (
    <GuardedRoute route={authRoutes.payPolicy}>
      <PayPolicyRouteContent />
    </GuardedRoute>
  );
}
