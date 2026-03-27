"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createScheduleRequest } from "#mutations/schedule-request/actions/createScheduleRequest";
import type { ScheduleRequestInput } from "#mutations/schedule-request/schemas/scheduleRequest";
import { queryKeys } from "#shared/constants/queryKeys";

export function useCreateScheduleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ScheduleRequestInput) => createScheduleRequest(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.scheduleRequests.employeeList(),
      });
    },
  });
}
