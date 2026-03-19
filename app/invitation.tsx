import { useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { GuardedRoute, authRoutes } from '@/features/auth/ui/auth-route';
import { InvitationScreen } from '@/features/invitations/ui/invitation-screen';

function InvitationRouteContent() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  if (!session || session.status !== 'active' || session.role !== 'admin') {
    return null;
  }

  return (
    <InvitationScreen
      session={session}
      onBackMembers={() => {
        router.replace(authRoutes.members);
      }}
    />
  );
}

export default function InvitationRoute() {
  return (
    <GuardedRoute route={authRoutes.invitation}>
      <InvitationRouteContent />
    </GuardedRoute>
  );
}
