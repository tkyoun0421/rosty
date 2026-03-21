import { useMutation } from '@tanstack/react-query';

import { assignmentWorkspaceQueryKey } from '@/features/assignments/api/fetch-assignment-workspace';
import { availabilityOverviewQueryKey } from '@/features/availability/api/fetch-availability-overview';
import { updateAvailabilityCollectionState } from '@/features/availability/api/update-availability-collection-state';
import type { AvailabilityCollectionState } from '@/features/schedules/model/schedules';
import { scheduleDetailQueryKey } from '@/features/schedules/api/fetch-schedule-detail';
import { scheduleListQueryKey } from '@/features/schedules/api/fetch-schedule-list';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useAvailabilityCollectionMutation(
  scheduleId: string,
  actorUserId: string,
) {
  return useMutation({
    mutationFn: (nextState: AvailabilityCollectionState) =>
      updateAvailabilityCollectionState({
        scheduleId,
        actorUserId,
        nextState,
      }),
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
          queryKey: ['my-availability', scheduleId],
        }),
      ]);
    },
  });
}
