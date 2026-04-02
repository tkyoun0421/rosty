import { notFound } from "next/navigation";

import { ApplicantAssignmentPanel } from "#flows/admin-schedule-assignment/components/ApplicantAssignmentPanel";
import { AttendanceReviewPanel } from "#flows/admin-schedule-assignment/components/AttendanceReviewPanel";
import { requireAdminUser } from "#queries/access/dal/requireAdminUser";
import { getAdminScheduleAssignmentDetail } from "#queries/assignment/dal/getAdminScheduleAssignmentDetail";
import { getAdminScheduleAttendanceDetail } from "#queries/attendance/dal/getAdminScheduleAttendanceDetail";

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

  const [assignmentDetail, attendanceDetail] = await Promise.all([
    getAdminScheduleAssignmentDetail(scheduleId),
    getAdminScheduleAttendanceDetail(scheduleId),
  ]);

  if (!assignmentDetail || !attendanceDetail) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-secondary/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8">
        <AttendanceReviewPanel detail={attendanceDetail} />
        <ApplicantAssignmentPanel detail={assignmentDetail} />
      </div>
    </main>
  );
}