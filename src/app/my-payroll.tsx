import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { MyPayrollScreen } from '@/features/payroll/ui/my-payroll-screen';

function MyPayrollRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role !== 'employee') {
    return null;
  }

  return (
    <MyPayrollScreen
      session={session}
      onBackHome={() => {
        router.replace(authRoutes.employeeHome);
      }}
    />
  );
}

export default function MyPayrollRoute() {
  return (
    <GuardedRoute route={authRoutes.myPayroll}>
      <MyPayrollRouteContent />
    </GuardedRoute>
  );
}
