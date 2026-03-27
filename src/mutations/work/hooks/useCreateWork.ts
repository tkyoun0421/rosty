"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createWork } from "#mutations/work/actions/createWork";
import type { WorkInput } from "#mutations/work/schemas/work";
import { queryKeys } from "#shared/constants/queryKeys";

export function useCreateWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: WorkInput) => createWork(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.work.current(),
      });
    },
  });
}
