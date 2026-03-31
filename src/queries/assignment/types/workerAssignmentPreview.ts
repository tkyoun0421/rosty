export interface PayPreviewBreakdown {
  regularHours: number;
  overtimeHours: number;
  overtimeApplied: boolean;
  hourlyRateCents: number;
  regularPayCents: number;
  overtimePayCents: number;
  totalPayCents: number;
}

export interface WorkerAssignmentPreview extends PayPreviewBreakdown {
  assignmentId: string;
  scheduleId: string;
  scheduleRoleSlotId: string;
  roleCode: string;
  startsAt: string;
  endsAt: string;
}
