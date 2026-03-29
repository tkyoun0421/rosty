"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAdminScheduleRequests } from "#queries/schedule-request/dal/fetchAdminScheduleRequests";
import { queryKeys } from "#shared/constants/queryKeys";

export function useAdminScheduleRequests() {
  return useQuery({
    queryKey: queryKeys.scheduleRequests.adminList(),
    queryFn: fetchAdminScheduleRequests,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}
