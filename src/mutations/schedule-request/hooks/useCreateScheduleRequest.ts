'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createScheduleRequest } from "#mutations/schedule-request/actions/createScheduleRequest";
import type { ScheduleRequestFormValues } from "#mutations/schedule-request/models/form/ScheduleRequestForm";

export function useCreateScheduleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ScheduleRequestFormValues) => createScheduleRequest(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["employee-schedule-requests"],
      });
    },
  });
}