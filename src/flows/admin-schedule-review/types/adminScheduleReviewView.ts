import type { ScheduleAssignmentPosition } from "#queries/schedule-request/types/scheduleRequest";
import type { ScheduleRequestHistoryItemViewModel } from "#queries/schedule-request/types/scheduleRequestHistoryView";
import type { ScheduleRequestNotificationView } from "#queries/schedule-request/types/scheduleRequestNotificationView";

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
  employeeResponseStatusLabel: string | null;
  employeeResponseComment: string | null;
  employeeRespondedAtLabel: string | null;
  employeeRespondedBy: string | null;
  isProcessed: boolean;
  notifications: ScheduleRequestNotificationView[];
  history: ScheduleRequestHistoryItemViewModel[];
};

export type AdminScheduleReviewViewProps = {
  list: {
    isLoading: boolean;
    errorMessage: string | null;
    items: AdminScheduleReviewItemViewModel[];
    reviewStatusFilter: "all" | "pending" | "approved" | "rejected";
    employeeResponseFilter: "all" | "pending" | "accepted" | "declined";
    sortOrder: "submitted-desc" | "work-date-asc";
    selectedRequestId: string | null;
    onReviewStatusFilterChange: (value: "all" | "pending" | "approved" | "rejected") => void;
    onEmployeeResponseFilterChange: (value: "all" | "pending" | "accepted" | "declined") => void;
    onSortOrderChange: (value: "submitted-desc" | "work-date-asc") => void;
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
