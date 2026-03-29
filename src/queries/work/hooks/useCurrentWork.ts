"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCurrentWork } from "#queries/work/dal/fetchCurrentWork";
import { queryKeys } from "#shared/constants/queryKeys";

export function useCurrentWork() {
  return useQuery({
    queryKey: queryKeys.work.current(),
    queryFn: fetchCurrentWork,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}
