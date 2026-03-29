import type { ScheduleAssignmentPosition } from "#queries/schedule-request/types/scheduleRequest";
import type { ScheduleRequestHistoryItemViewModel } from "#queries/schedule-request/types/scheduleRequestHistoryView";

export type AdminScheduleReviewItemViewModel = {
  id: string;
  employeeId: string;
  workDate: string;
  workTimeLabel: string;
  statusLabel: string;
  submittedAtLabel: string;
  note: string;
  adminComment: string | null;
  assignmentPositionLabel: string | null;
  assignedLocation: string | null;
  assignedAtLabel: string | null;
  assignedBy: string | null;
  isProcessed: boolean;
  history: ScheduleRequestHistoryItemViewModel[];
};

export type AdminScheduleReviewViewProps = {
  list: {
    isLoading: boolean;
    errorMessage: string | null;
    items: AdminScheduleReviewItemViewModel[];
    selectedRequestId: string | null;
    onSelectRequest: (requestId: string) => void;
  };
  detail: {
    selectedRequest: AdminScheduleReviewItemViewModel | null;
    assignmentPosition: ScheduleAssignmentPosition | "";
    onAssignmentPositionChange: (value: ScheduleAssignmentPosition | "") => void;
    adminComment: string;
    onAdminCommentChange: (value: string) => void;
    onApprove: () => Promise<void>;
    onReject: () => Promise<void>;
    isSubmitting: boolean;
    submitErrorMessage: string | null;
    successMessage: string | null;
    isApproveDisabled: boolean;
    isRejectDisabled: boolean;
    helperMessage: string | null;
  };
};
