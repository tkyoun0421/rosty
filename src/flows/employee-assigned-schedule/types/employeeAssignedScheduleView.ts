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
  };
};
