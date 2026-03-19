import { useMutation } from '@tanstack/react-query';

import { authProfileQueryKey } from '@/features/auth/api/fetch-auth-profile';
import { upsertAuthProfile } from '@/features/auth/api/upsert-auth-profile';
import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import type { ProfileSetupSubmission } from '@/features/auth/model/profile-setup';
import { completeEmployeeJoin } from '@/features/invitations/api/consume-invitation-link';
import { invitationJoinQueryKey } from '@/features/invitations/api/fetch-invitation-join';
import { invitationLinksQueryKey } from '@/features/invitations/api/fetch-invitation-links';
import { requiresEmployeeInvitation } from '@/features/invitations/model/invitation-join';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useProfileSetupMutation(
  session: AuthSession | null,
  invitationToken: string | null,
) {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const clearPendingInvitationToken = useAuthStore(
    (state) => state.clearPendingInvitationToken,
  );

  return useMutation({
    mutationFn: async (values: ProfileSetupSubmission) => {
      if (!session) {
        throw new Error('No active session was available for profile setup.');
      }

      if (requiresEmployeeInvitation(session)) {
        if (!invitationToken) {
          throw new Error(
            'Open the employee invitation link again before submitting your profile.',
          );
        }

        await completeEmployeeJoin({
          invitationToken,
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
        });
        return;
      }

      await upsertAuthProfile({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
      });
    },
    onSuccess: async () => {
      if (session) {
        await queryClient.invalidateQueries({
          queryKey: authProfileQueryKey(session.userId),
        });
      }

      if (invitationToken) {
        await queryClient.invalidateQueries({
          queryKey: invitationJoinQueryKey(invitationToken),
        });
      }

      await queryClient.invalidateQueries({
        queryKey: invitationLinksQueryKey,
      });

      clearPendingInvitationToken();
      await restoreSession();
    },
  });
}