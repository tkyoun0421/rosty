export type AssignmentStatus = "draft" | "confirmed";

export interface ScheduleAssignmentRecord {
  id: string;
  scheduleId: string;
  scheduleRoleSlotId: string;
  workerUserId: string;
  status: AssignmentStatus;
  confirmedAt: string | null;
  confirmedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
