"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchEmployeeScheduleRequests } from "#queries/schedule-request/dal/fetchEmployeeScheduleRequests";
import { queryKeys } from "#shared/constants/queryKeys";

export function useEmployeeScheduleRequests() {
  return useQuery({
    queryKey: queryKeys.scheduleRequests.employeeList(),
    queryFn: fetchEmployeeScheduleRequests,
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}
