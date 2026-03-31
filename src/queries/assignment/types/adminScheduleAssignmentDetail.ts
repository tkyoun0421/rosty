import type { ScheduleStatus } from "#shared/model/schedule";

export type AdminApplicantAssignmentStatus = "unassigned" | "draft_assigned" | "confirmed_assigned";

export interface AdminScheduleAssignmentDetail {
  schedule: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: ScheduleStatus;
  };
  roleSlots: Array<{
    id: string;
    roleCode: string;
    headcount: number;
    assignedCount: number;
  }>;
  applicants: Array<{
    workerUserId: string;
    workerName: string | null;
    appliedAt: string;
    assignmentStatus: AdminApplicantAssignmentStatus;
    assignedRoleSlotId: string | null;
    assignedRoleCode: string | null;
  }>;
}
