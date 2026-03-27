'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchEmployeeScheduleRequests } from "#queries/schedule-request/lib/fetchEmployeeScheduleRequests";

export function useEmployeeScheduleRequests() {
  return useQuery({
    queryKey: ["employee-schedule-requests"],
    queryFn: fetchEmployeeScheduleRequests,
  });
}