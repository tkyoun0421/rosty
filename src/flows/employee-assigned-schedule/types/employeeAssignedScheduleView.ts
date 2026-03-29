import type { ScheduleRequestHistoryItemViewModel } from "#queries/schedule-request/types/scheduleRequestHistoryView";

export type EmployeeAssignedScheduleItemViewModel = {
  id: string;
  workDate: string;
  workTimeLabel: string;
  assignmentPositionLabel: string;
  assignedLocation: string;
  submittedAtLabel: string;
  assignedAtLabel: string | null;
  assignedBy: string | null;
  note: string;
  adminComment: string | null;
  employeeResponseStatusLabel: string | null;
  employeeResponseComment: string | null;
  employeeRespondedAtLabel: string | null;
  employeeRespondedBy: string | null;
  responseDraftComment: string;
  responseHelperMessage: string | null;
  responseErrorMessage: string | null;
  isResponding: boolean;
  canRespond: boolean;
  history: ScheduleRequestHistoryItemViewModel[];
};

export type EmployeeAssignedScheduleViewProps = {
  summary: {
    assignedCountLabel: string;
    nextShiftLabel: string;
  };
  schedule: {
    isLoading: boolean;
    errorMessage: string | null;
    items: EmployeeAssignedScheduleItemViewModel[];
    onResponseCommentChange: (requestId: string, value: string) => void;
    onAccept: (requestId: string) => Promise<void>;
    onDecline: (requestId: string) => Promise<void>;
  };
};
