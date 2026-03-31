export type WorkerAttendanceWindowStatus = "not_open_yet" | "open" | "submitted";

export type WorkerAttendanceSubmissionStatus = "not_submitted" | "submitted";

export interface WorkerAttendanceStatus {
  assignmentId: string;
  scheduleId: string;
  checkInOpensAt: string;
  windowStatus: WorkerAttendanceWindowStatus;
  submissionStatus: WorkerAttendanceSubmissionStatus;
  checkedInAt: string | null;
  isLate: boolean | null;
}
