"use client";

import { AdminScheduleReviewView } from "#flows/admin-schedule-review/components/AdminScheduleReviewView.client";
import { useAdminScheduleReview } from "#flows/admin-schedule-review/hooks/useAdminScheduleReview";

export function AdminScheduleReview() {
  const viewModel = useAdminScheduleReview();

  return <AdminScheduleReviewView {...viewModel} />;
}
