import { useMutation } from '@tanstack/react-query';

import { workTimeQueryKey } from '@/features/work-time/api/fetch-work-time';
import { saveWorkTime } from '@/features/work-time/api/save-work-time';
import { scheduleDetailQueryKey } from '@/features/schedules/api/fetch-schedule-detail';
import { scheduleListQueryKey } from '@/features/schedules/api/fetch-schedule-list';
import { teamPayrollQueryKey } from '@/features/payroll/api/fetch-team-payroll';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useWorkTimeMutation(scheduleId: string, actorUserId: string) {
  return useMutation({
    mutationFn: (input: {
      plannedStartAt: string | null;
      plannedEndAt: string | null;
      actualStartAt: string | null;
      actualEndAt: string | null;
      status: 'planned' | 'actual_recorded' | 'corrected';
    }) =>
      saveWorkTime({
        scheduleId,
        actorUserId,
        ...input,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: workTimeQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: scheduleDetailQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: scheduleListQueryKey,
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
