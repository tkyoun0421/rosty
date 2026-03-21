import { useMutation } from '@tanstack/react-query';

import { assignmentDetailQueryKey } from '@/features/assignments/api/fetch-assignment-detail';
import { assignmentWorkspaceQueryKey } from '@/features/assignments/api/fetch-assignment-workspace';
import { cancellationQueueQueryKey } from '@/features/assignments/api/fetch-cancellation-queue';
import { availabilityOverviewQueryKey } from '@/features/availability/api/fetch-availability-overview';
import { teamPayrollQueryKey } from '@/features/payroll/api/fetch-team-payroll';
import { scheduleDetailQueryKey } from '@/features/schedules/api/fetch-schedule-detail';
import { scheduleListQueryKey } from '@/features/schedules/api/fetch-schedule-list';
import { cancelScheduleOperation } from '@/features/schedules/api/cancel-schedule-operation';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useScheduleCancellationMutation(scheduleId: string) {
  return useMutation({
    mutationFn: () => cancelScheduleOperation(scheduleId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: scheduleDetailQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: scheduleListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: availabilityOverviewQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: assignmentWorkspaceQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: cancellationQueueQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ['my-assignments'],
        }),
        queryClient.invalidateQueries({
          queryKey: assignmentDetailQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: teamPayrollQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ['team-payroll', 'me'],
        }),
      ]);
    },
  });
}
