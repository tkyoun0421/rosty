import { useMutation } from '@tanstack/react-query';

import { authProfileQueryKey } from '@/features/auth/api/fetch-auth-profile';
import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import { deactivateMyAccount } from '@/features/settings/api/deactivate-my-account';
import { settingsProfileQueryKey } from '@/features/settings/api/fetch-settings-profile';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useDeactivateAccountMutation(session: AuthSession | null) {
  const signOut = useAuthStore((state) => state.signOut);

  return useMutation({
    mutationFn: async () => {
      if (!session) {
        throw new Error('No active session was available for account deactivation.');
      }

      return deactivateMyAccount();
    },
    onSuccess: async () => {
      if (session) {
        queryClient.removeQueries({
          queryKey: settingsProfileQueryKey(session.userId),
        });
        queryClient.removeQueries({
          queryKey: authProfileQueryKey(session.userId),
        });
      }

      await signOut();
    },
  });
}
