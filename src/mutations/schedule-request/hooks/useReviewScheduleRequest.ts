"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reviewScheduleRequest } from "#mutations/schedule-request/actions/reviewScheduleRequest";
import type { ReviewScheduleRequestInput } from "#mutations/schedule-request/schemas/reviewScheduleRequest";
import { queryKeys } from "#shared/constants/queryKeys";

export function useReviewScheduleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ReviewScheduleRequestInput) => reviewScheduleRequest(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.scheduleRequests.list(),
      });
    },
  });
}
