import { useMutation } from '@tanstack/react-query';

import { assignmentDetailQueryKey } from '@/features/assignments/api/fetch-assignment-detail';
import { myAssignmentsQueryKey } from '@/features/assignments/api/fetch-my-assignments';
import { requestAssignmentCancellation } from '@/features/assignments/api/request-assignment-cancellation';
import { myPayrollQueryKey } from '@/features/payroll/api/fetch-my-payroll';
import { teamPayrollQueryKey } from '@/features/payroll/api/fetch-team-payroll';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useAssignmentCancellationMutation(
  userId: string,
  scheduleId: string,
) {
  return useMutation({
    mutationFn: requestAssignmentCancellation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: myAssignmentsQueryKey(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: assignmentDetailQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: myPayrollQueryKey(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: teamPayrollQueryKey,
        }),
      ]);
    },
  });
}
