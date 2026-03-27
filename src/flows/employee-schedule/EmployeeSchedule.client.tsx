'use client';

import { EmployeeScheduleView } from "#flows/employee-schedule/components/EmployeeScheduleView.client";
import { useEmployeeSchedule } from "#flows/employee-schedule/hooks/useEmployeeSchedule";

export function EmployeeSchedule() {
  const viewModel = useEmployeeSchedule();

  return <EmployeeScheduleView {...viewModel} />;
}