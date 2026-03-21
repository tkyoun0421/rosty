import { useMutation } from '@tanstack/react-query';

import { assignmentWorkspaceQueryKey } from '@/features/assignments/api/fetch-assignment-workspace';
import {
  clearAssignmentDraft,
  saveAssignmentDraft,
} from '@/features/assignments/api/save-assignment-draft';
import { confirmScheduleAssignments } from '@/features/assignments/api/confirm-schedule-assignments';
import { scheduleDetailQueryKey } from '@/features/schedules/api/fetch-schedule-detail';
import { scheduleListQueryKey } from '@/features/schedules/api/fetch-schedule-list';
import { availabilityOverviewQueryKey } from '@/features/availability/api/fetch-availability-overview';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useSaveAssignmentDraftMutation(scheduleId: string) {
  return useMutation({
    mutationFn: saveAssignmentDraft,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: assignmentWorkspaceQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: availabilityOverviewQueryKey(scheduleId),
        }),
      ]);
    },
  });
}

export function useClearAssignmentDraftMutation(scheduleId: string) {
  return useMutation({
    mutationFn: clearAssignmentDraft,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: assignmentWorkspaceQueryKey(scheduleId),
        }),
        queryClient.invalidateQueries({
          queryKey: availabilityOverviewQueryKey(scheduleId),
        }),
      ]);
    },
  });
}

export function useConfirmScheduleAssignmentsMutation(scheduleId: string) {
  return useMutation({
    mutationFn: () => confirmScheduleAssignments(scheduleId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: assignmentWorkspaceQueryKey(scheduleId),
        }),
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
          queryKey: ['my-assignments'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['assignment-detail'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['team-payroll'],
        }),
      ]);
    },
  });
}
