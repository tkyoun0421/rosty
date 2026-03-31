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
    <main
      style={{
        backgroundColor: "#F6F1E8",
        minHeight: "100vh",
        padding: "32px",
      }}
    >
      <div style={{ display: "grid", gap: "32px" }}>
        <AttendanceReviewPanel detail={attendanceDetail} />
        <ApplicantAssignmentPanel detail={assignmentDetail} />
      </div>
    </main>
  );
}