"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { respondScheduleAssignment } from "#mutations/schedule-request/actions/respondScheduleAssignment";
import type { RespondScheduleAssignmentInput } from "#mutations/schedule-request/schemas/respondScheduleAssignment";
import { queryKeys } from "#shared/constants/queryKeys";

export function useRespondScheduleAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RespondScheduleAssignmentInput) => respondScheduleAssignment(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.scheduleRequests.list(),
      });
    },
  });
}
