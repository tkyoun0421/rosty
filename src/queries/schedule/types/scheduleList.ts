import type { ScheduleStatus } from "#shared/model/schedule";

export interface AdminScheduleRoleSlotSummary {
  roleCode: string;
  headcount: number;
}

export interface AdminScheduleListItem {
  id: string;
  startsAt: string;
  endsAt: string;
  status: ScheduleStatus;
  roleSlotSummary: AdminScheduleRoleSlotSummary[];
}
