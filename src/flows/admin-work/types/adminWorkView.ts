import type React from "react";

export type AdminWorkViewProps = {
  currentWork: {
    isLoading: boolean;
    errorMessage: string | null;
    workDate: string | null;
    workTimeLabel: string | null;
    helperMessage: string;
  };
  form: {
    values: {
      workDate: string;
      startTime: string;
      endTime: string;
    };
    errors: {
      workDate: string | null;
      startTime: string | null;
      endTime: string | null;
    };
    isSubmitting: boolean;
    submitErrorMessage: string | null;
    successMessage: string | null;
    onWorkDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
    onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
  };
};
