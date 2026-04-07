export type WorkerAssignmentPayStatus = "ready" | "missing_worker_rate";

export interface PayPreviewBreakdown {
  regularHours: number | null;
  overtimeHours: number | null;
  overtimeApplied: boolean;
  hourlyRateCents: number | null;
  regularPayCents: number | null;
  overtimePayCents: number | null;
  totalPayCents: number | null;
}

export interface WorkerAssignmentPreview extends PayPreviewBreakdown {
  assignmentId: string;
  scheduleId: string;
  scheduleRoleSlotId: string;
  roleCode: string;
  startsAt: string;
  endsAt: string;
  payStatus: WorkerAssignmentPayStatus;
}
