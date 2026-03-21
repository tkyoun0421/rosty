export type WorkTimeStatus = 'planned' | 'actual_recorded' | 'corrected';

export type WorkTimeRecord = {
  scheduleId: string;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  status: WorkTimeStatus;
  updatedAt: string | null;
};

export type WorkTimeFormValues = {
  plannedStartAt: string;
  plannedEndAt: string;
  actualStartAt: string;
  actualEndAt: string;
};

export type WorkTimeFieldErrors = Partial<Record<keyof WorkTimeFormValues, string>>;

export function canCompleteScheduleOperation(input: {
  scheduleStatus:
    | 'collecting'
    | 'assigned'
    | 'completed'
    | 'cancelled'
    | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
}): boolean {
  return (
    input.scheduleStatus === 'assigned' &&
    !!input.actualStartAt &&
    !!input.actualEndAt
  );
}

export function createWorkTimeFormValues(record: WorkTimeRecord | null): WorkTimeFormValues {
  return {
    plannedStartAt: record?.plannedStartAt ?? '',
    plannedEndAt: record?.plannedEndAt ?? '',
    actualStartAt: record?.actualStartAt ?? '',
    actualEndAt: record?.actualEndAt ?? '',
  };
}

function parseDate(value: string): Date | null {
  if (value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function validateWorkTimeForm(
  values: WorkTimeFormValues,
): {
  status: WorkTimeStatus | null;
  errors: WorkTimeFieldErrors;
  normalized: WorkTimeFormValues;
} {
  const normalized: WorkTimeFormValues = {
    plannedStartAt: values.plannedStartAt.trim(),
    plannedEndAt: values.plannedEndAt.trim(),
    actualStartAt: values.actualStartAt.trim(),
    actualEndAt: values.actualEndAt.trim(),
  };
  const errors: WorkTimeFieldErrors = {};
  const plannedStart = parseDate(normalized.plannedStartAt);
  const plannedEnd = parseDate(normalized.plannedEndAt);
  const actualStart = parseDate(normalized.actualStartAt);
  const actualEnd = parseDate(normalized.actualEndAt);

  if ((normalized.plannedStartAt && !normalized.plannedEndAt) || (!normalized.plannedStartAt && normalized.plannedEndAt)) {
    errors.plannedStartAt = 'Enter both planned start and end times.';
    errors.plannedEndAt = 'Enter both planned start and end times.';
  } else if (
    plannedStart &&
    plannedEnd &&
    plannedEnd.getTime() <= plannedStart.getTime()
  ) {
    errors.plannedEndAt = 'Planned end time must be after planned start time.';
  }

  if ((normalized.actualStartAt && !normalized.actualEndAt) || (!normalized.actualStartAt && normalized.actualEndAt)) {
    errors.actualStartAt = 'Enter both actual start and end times.';
    errors.actualEndAt = 'Enter both actual start and end times.';
  } else if (
    actualStart &&
    actualEnd &&
    actualEnd.getTime() <= actualStart.getTime()
  ) {
    errors.actualEndAt = 'Actual end time must be after actual start time.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: null,
      errors,
      normalized,
    };
  }

  return {
    status: actualStart && actualEnd ? 'actual_recorded' : 'planned',
    errors,
    normalized,
  };
}
