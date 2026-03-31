import { AdminScheduleAssignmentPage } from "#flows/admin-schedule-assignment/components/AdminScheduleAssignmentPage";

interface AdminScheduleAssignmentRouteProps {
  params: Promise<{
    scheduleId: string;
  }>;
}

export default async function AdminScheduleAssignmentRoute({
  params,
}: AdminScheduleAssignmentRouteProps) {
  const { scheduleId } = await params;

  return await AdminScheduleAssignmentPage({ scheduleId });
}
