"use client";

import { AdminWorkView } from "#flows/admin-work/components/AdminWorkView.client";
import { useAdminWork } from "#flows/admin-work/hooks/useAdminWork";

export function AdminWork() {
  const viewModel = useAdminWork();

  return <AdminWorkView {...viewModel} />;
}
