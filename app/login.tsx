import { LoginScreen } from '@/features/auth/ui/auth-screens';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';

export default function LoginRoute() {
  return (
    <GuardedRoute route={authRoutes.login}>
      <LoginScreen />
    </GuardedRoute>
  );
}
