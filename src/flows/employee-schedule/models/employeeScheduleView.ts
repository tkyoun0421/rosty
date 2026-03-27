import type React from "react";

import type {
  ScheduleRequestRole,
  ScheduleRequestTimeSlot,
} from "#queries/schedule-request/models/dto/scheduleRequest";

export type EmployeeScheduleRequestItemViewModel = {
  id: string;
  workDate: string;
  timeSlotLabel: string;
  statusLabel: string;
  roleLabel: string;
  submittedAtLabel: string;
  note: string;
  adminComment: string | null;
};

export type EmployeeScheduleViewProps = {
  form: {
    values: {
      workDate: string;
      timeSlot: ScheduleRequestTimeSlot;
      role: ScheduleRequestRole;
      note: string;
    };
    errors: {
      workDate: string | null;
      note: string | null;
    };
    isSubmitting: boolean;
    submitErrorMessage: string | null;
    successMessage: string | null;
    onWorkDateChange: (value: string) => void;
    onTimeSlotChange: (value: ScheduleRequestTimeSlot) => void;
    onRoleChange: (value: ScheduleRequestRole) => void;
    onNoteChange: (value: string) => void;
    onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  };
  requests: {
    isLoading: boolean;
    errorMessage: string | null;
    summary: {
      pending: number;
      approved: number;
      rejected: number;
    };
    items: EmployeeScheduleRequestItemViewModel[];
  };
};