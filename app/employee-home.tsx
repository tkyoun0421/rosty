import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { EmployeeHomeScreen } from '@/features/home/ui/home-screen';

function EmployeeHomeRouteContent() {
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role !== 'employee') {
    return null;
  }

  return <EmployeeHomeScreen session={session} />;
}

export default function EmployeeHomeRoute() {
  return (
    <GuardedRoute route={authRoutes.employeeHome}>
      <EmployeeHomeRouteContent />
    </GuardedRoute>
  );
}
