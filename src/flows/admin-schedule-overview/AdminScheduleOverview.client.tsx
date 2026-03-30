"use client";

import { AdminScheduleOverviewView } from "#flows/admin-schedule-overview/components/AdminScheduleOverviewView.client";
import { useAdminScheduleOverview } from "#flows/admin-schedule-overview/hooks/useAdminScheduleOverview";

export function AdminScheduleOverview() {
  const viewModel = useAdminScheduleOverview();

  return <AdminScheduleOverviewView {...viewModel} />;
}
