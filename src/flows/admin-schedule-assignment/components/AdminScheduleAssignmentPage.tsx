import { notFound } from "next/navigation";

import { ApplicantAssignmentPanel } from "#flows/admin-schedule-assignment/components/ApplicantAssignmentPanel";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { getAdminScheduleAssignmentDetail } from "#queries/assignment/dal/getAdminScheduleAssignmentDetail";

interface AdminScheduleAssignmentPageProps {
  scheduleId: string;
}

export async function AdminScheduleAssignmentPage({
  scheduleId,
}: AdminScheduleAssignmentPageProps) {
  try {
    await requireAdminUser();
  } catch {
    return <main>Admin access required.</main>;
  }

  const detail = await getAdminScheduleAssignmentDetail(scheduleId);

  if (!detail) {
    notFound();
  }

  return (
    <main
      style={{
        backgroundColor: "#F6F1E8",
        minHeight: "100vh",
        padding: "32px",
      }}
    >
      <ApplicantAssignmentPanel detail={detail} />
    </main>
  );
}
