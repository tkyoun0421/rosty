import { useMutation } from '@tanstack/react-query';

import { saveSchedule } from '@/features/schedules/api/save-schedule';
import { scheduleListQueryKey } from '@/features/schedules/api/fetch-schedule-list';
import { scheduleDetailQueryKey } from '@/features/schedules/api/fetch-schedule-detail';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useSaveScheduleMutation(
  scheduleId: string | null,
  actorUserId: string,
) {
  return useMutation({
    mutationFn: (payload: Parameters<typeof saveSchedule>[0]['payload']) =>
      saveSchedule({
        scheduleId,
        actorUserId,
        payload,
      }),
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: scheduleListQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: scheduleDetailQueryKey(data.scheduleId),
        }),
      ]);
    },
  });
}
