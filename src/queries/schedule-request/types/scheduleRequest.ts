export type ScheduleAssignmentPosition =
  | "teamLead"
  | "scan"
  | "main"
  | "dress"
  | "waitingRoom"
  | "congratulatorySong"
  | "manager"
  | "guide"
  | "dressRoom";
export type ScheduleRequestStatus = "pending" | "approved" | "rejected";

export type EmployeeScheduleRequest = {
  id: string;
  employeeId: string;
  workId: string;
  workDate: string;
  workStartAt: Date;
  workEndAt: Date;
  note: string;
  status: ScheduleRequestStatus;
  submittedAt: Date;
  adminComment: string | null;
  assignmentPosition: ScheduleAssignmentPosition | null;
  assignedLocation: string | null;
  assignedAt: Date | null;
  assignedBy: string | null;
};
