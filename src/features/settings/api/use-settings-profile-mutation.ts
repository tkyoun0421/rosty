import { useMutation } from '@tanstack/react-query';

import { authProfileQueryKey } from '@/features/auth/api/fetch-auth-profile';
import type { AuthSession } from '@/features/auth/model/auth-types';
import type { ProfileSetupSubmission } from '@/features/auth/model/profile-setup';
import { settingsProfileQueryKey } from '@/features/settings/api/fetch-settings-profile';
import { updateSettingsProfile } from '@/features/settings/api/update-settings-profile';
import { useAuthStore } from '@/features/auth/model/auth-store';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useSettingsProfileMutation(session: AuthSession | null) {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  return useMutation({
    mutationFn: async (values: ProfileSetupSubmission) => {
      if (!session) {
        throw new Error('No active session was available for settings update.');
      }

      return updateSettingsProfile(values);
    },
    onSuccess: async () => {
      if (!session) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: settingsProfileQueryKey(session.userId),
        }),
        queryClient.invalidateQueries({
          queryKey: authProfileQueryKey(session.userId),
        }),
      ]);

      await restoreSession();
    },
  });
}
