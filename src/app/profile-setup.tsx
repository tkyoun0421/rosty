import { ProfileSetupScreen } from '@/features/auth/ui/auth-screens';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';

export default function ProfileSetupRoute() {
  return (
    <GuardedRoute route={authRoutes.profileSetup}>
      <ProfileSetupScreen />
    </GuardedRoute>
  );
}
