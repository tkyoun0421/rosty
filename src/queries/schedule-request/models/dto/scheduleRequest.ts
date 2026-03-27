export type ScheduleRequestTimeSlot = "morning" | "afternoon" | "evening";
export type ScheduleRequestRole = "consulting" | "service" | "ceremony";
export type ScheduleRequestStatus = "pending" | "approved" | "rejected";

export type EmployeeScheduleRequestDto = {
  id: string;
  employeeId: string;
  workDate: string;
  timeSlot: ScheduleRequestTimeSlot;
  role: ScheduleRequestRole;
  note: string;
  status: ScheduleRequestStatus;
  submittedAt: string;
  adminComment: string | null;
};