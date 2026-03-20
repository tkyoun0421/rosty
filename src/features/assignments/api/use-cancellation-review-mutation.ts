import { useMutation } from '@tanstack/react-query';

import { cancellationQueueQueryKey } from '@/features/assignments/api/fetch-cancellation-queue';
import { reviewCancellationRequest } from '@/features/assignments/api/review-cancellation-request';
import { teamPayrollQueryKey } from '@/features/payroll/api/fetch-team-payroll';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useCancellationReviewMutation() {
  return useMutation({
    mutationFn: reviewCancellationRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: cancellationQueueQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ['my-assignments'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['assignment-detail'],
        }),
        queryClient.invalidateQueries({
          queryKey: [...teamPayrollQueryKey],
        }),
        queryClient.invalidateQueries({
          queryKey: ['team-payroll', 'me'],
        }),
      ]);
    },
  });
}
