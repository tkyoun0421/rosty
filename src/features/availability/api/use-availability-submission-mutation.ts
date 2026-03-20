import { useMutation } from '@tanstack/react-query';

import { myAvailabilityQueryKey } from '@/features/availability/api/fetch-my-availability';
import { submitAvailabilityResponse } from '@/features/availability/api/submit-availability-response';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useAvailabilitySubmissionMutation(
  scheduleId: string,
  userId: string,
) {
  return useMutation({
    mutationFn: submitAvailabilityResponse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: myAvailabilityQueryKey(scheduleId, userId),
      });
    },
  });
}
