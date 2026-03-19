import { useMutation } from '@tanstack/react-query';

import { authProfileQueryKey } from '@/features/auth/api/fetch-auth-profile';
import { upsertAuthProfile } from '@/features/auth/api/upsert-auth-profile';
import { useAuthStore } from '@/features/auth/model/auth-store';
import type { AuthSession } from '@/features/auth/model/auth-types';
import type { ProfileSetupSubmission } from '@/features/auth/model/profile-setup';
import {
  claimInvitationLink,
  releaseClaimedInvitationLink,
} from '@/features/invitations/api/consume-invitation-link';
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

      let claimedInvitation: { consumedAt: string } | null = null;

      try {
        if (requiresEmployeeInvitation(session)) {
          if (!invitationToken) {
            throw new Error(
              'Open the employee invitation link again before submitting your profile.',
            );
          }

          claimedInvitation = await claimInvitationLink({
            token: invitationToken,
            userId: session.userId,
          });
        }

        await upsertAuthProfile({
          userId: session.userId,
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          role: session.role,
        });
      } catch (error) {
        if (session && invitationToken && claimedInvitation) {
          try {
            await releaseClaimedInvitationLink({
              token: invitationToken,
              userId: session.userId,
              consumedAt: claimedInvitation.consumedAt,
            });
          } catch {
            // Best effort rollback only. The admin can still reissue if needed.
          }
        }

        throw error;
      }
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
