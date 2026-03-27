export type AdminScheduleReviewItemViewModel = {
  id: string;
  employeeId: string;
  workDate: string;
  timeSlotLabel: string;
  roleLabel: string;
  statusLabel: string;
  submittedAtLabel: string;
  note: string;
  adminComment: string | null;
  isProcessed: boolean;
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
    adminComment: string;
    onAdminCommentChange: (value: string) => void;
    onApprove: () => Promise<void>;
    onReject: () => Promise<void>;
    isSubmitting: boolean;
    submitErrorMessage: string | null;
    successMessage: string | null;
    areActionsDisabled: boolean;
    helperMessage: string | null;
  };
};
