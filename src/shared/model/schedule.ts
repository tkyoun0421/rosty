export type ScheduleStatus = "recruiting" | "assigning" | "confirmed";

export interface ScheduleRoleSlotInput {
  roleCode: string;
  headcount: number;
}

export interface ScheduleRecord {
  id: string;
  startsAt: string;
  endsAt: string;
  status: ScheduleStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleWithRoleSlots extends ScheduleRecord {
  roleSlots: ScheduleRoleSlotInput[];
}
