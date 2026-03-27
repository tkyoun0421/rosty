import type React from "react";

import type { ScheduleRequestStatus } from "#queries/schedule-request/types/scheduleRequest";

export type EmployeeScheduleRequestItemViewModel = {
  id: string;
  workDate: string;
  workTimeLabel: string;
  statusLabel: string;
  submittedAtLabel: string;
  note: string;
  adminComment: string | null;
  assignmentPositionLabel: string | null;
};

export type EmployeeScheduleViewProps = {
  currentWork: {
    isLoading: boolean;
    errorMessage: string | null;
    isAvailable: boolean;
    workDate: string | null;
    workTimeLabel: string | null;
    helperMessage: string;
  };
  form: {
    values: {
      note: string;
    };
    errors: {
      note: string | null;
    };
    isSubmitting: boolean;
    isDisabled: boolean;
    submitErrorMessage: string | null;
    successMessage: string | null;
    onNoteChange: (value: string) => void;
    onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  };
  requests: {
    isLoading: boolean;
    errorMessage: string | null;
    controls: {
      statusFilter: "all" | ScheduleRequestStatus;
      sortOrder: "submitted-desc" | "work-date-asc";
      resultCountLabel: string;
      onStatusFilterChange: (value: "all" | ScheduleRequestStatus) => void;
      onSortOrderChange: (value: "submitted-desc" | "work-date-asc") => void;
    };
    summary: {
      pending: number;
      approved: number;
      rejected: number;
    };
    items: EmployeeScheduleRequestItemViewModel[];
  };
};
