export type AdminAttendanceStatus =
  | "checked_in"
  | "late"
  | "not_checked_in"
  | "not_open_yet";

export interface AdminScheduleAttendanceDetail {
  schedule: {
    id: string;
    startsAt: string;
    endsAt: string;
    opensAt: string;
  };
  summary: {
    confirmedWorkerCount: number;
    checkedInCount: number;
    lateCount: number;
    notCheckedInCount: number;
    notOpenYetCount: number;
  };
  workers: Array<{
    scheduleAssignmentId: string;
    workerUserId: string;
    workerName: string | null;
    roleSlotId: string;
    roleCode: string | null;
    status: AdminAttendanceStatus;
    checkedInAt: string | null;
    isLate: boolean;
  }>;
}