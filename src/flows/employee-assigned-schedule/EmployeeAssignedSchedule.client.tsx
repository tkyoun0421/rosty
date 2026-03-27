"use client";

import { EmployeeAssignedScheduleView } from "#flows/employee-assigned-schedule/components/EmployeeAssignedScheduleView.client";
import { useEmployeeAssignedSchedule } from "#flows/employee-assigned-schedule/hooks/useEmployeeAssignedSchedule";

export function EmployeeAssignedSchedule() {
  const viewModel = useEmployeeAssignedSchedule();

  return <EmployeeAssignedScheduleView {...viewModel} />;
}
