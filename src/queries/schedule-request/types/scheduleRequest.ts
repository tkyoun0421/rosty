export type ScheduleRequestTimeSlot = "morning" | "afternoon" | "evening";
export type ScheduleRequestRole = "consulting" | "service" | "ceremony";
export type ScheduleRequestStatus = "pending" | "approved" | "rejected";

export type EmployeeScheduleRequest = {
  id: string;
  employeeId: string;
  workDate: string;
  timeSlot: ScheduleRequestTimeSlot;
  role: ScheduleRequestRole;
  note: string;
  status: ScheduleRequestStatus;
  submittedAt: Date;
  adminComment: string | null;
};