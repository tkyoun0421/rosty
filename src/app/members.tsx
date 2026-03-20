import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { MembersScreen } from '@/features/members/ui/members-screen';

function MembersRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role !== 'admin') {
    return null;
  }

  return (
    <MembersScreen
      session={session}
      onBackHome={() => {
        router.replace(authRoutes.managerHome);
      }}
      onOpenInvitation={() => {
        router.push(authRoutes.invitation);
      }}
      onOpenPayPolicy={() => {
        router.push(authRoutes.payPolicy);
      }}
    />
  );
}

export default function MembersRoute() {
  return (
    <GuardedRoute route={authRoutes.members}>
      <MembersRouteContent />
    </GuardedRoute>
  );
}
