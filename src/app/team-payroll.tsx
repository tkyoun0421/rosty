import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { TeamPayrollScreen } from '@/features/payroll/ui/team-payroll-screen';

function TeamPayrollRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role === 'employee') {
    return null;
  }

  return (
    <TeamPayrollScreen
      session={session}
      onBackHome={() => {
        router.replace(authRoutes.managerHome);
      }}
      onOpenPayPolicy={
        session.role === 'admin'
          ? () => {
              router.push(authRoutes.payPolicy);
            }
          : undefined
      }
    />
  );
}

export default function TeamPayrollRoute() {
  return (
    <GuardedRoute route={authRoutes.teamPayroll}>
      <TeamPayrollRouteContent />
    </GuardedRoute>
  );
}
