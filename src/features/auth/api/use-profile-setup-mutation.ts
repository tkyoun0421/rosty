import { useMutation } from '@tanstack/react-query';

import { authProfileQueryKey } from '@/features/auth/api/fetch-auth-profile';
import { upsertAuthProfile } from '@/features/auth/api/upsert-auth-profile';
import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import type { ProfileSetupSubmission } from '@/features/auth/model/profile-setup';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useProfileSetupMutation(session: AuthSession | null) {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  return useMutation({
    mutationFn: async (values: ProfileSetupSubmission) => {
      if (!session) {
        throw new Error('No active session was available for profile setup.');
      }

      await upsertAuthProfile({
        userId: session.userId,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        role: session.role,
      });
    },
    onSuccess: async () => {
      if (session) {
        await queryClient.invalidateQueries({
          queryKey: authProfileQueryKey(session.userId),
        });
      }

      await restoreSession();
    },
  });
}
