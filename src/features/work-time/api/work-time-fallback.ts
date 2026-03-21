let seededWorkTimeByScheduleId: Record<
  string,
  {
    planned_start_at: string | null;
    planned_end_at: string | null;
    actual_start_at: string | null;
    actual_end_at: string | null;
    status: 'planned' | 'actual_recorded' | 'corrected';
    updated_at: string | null;
  }
> = {
  'schedule-1': {
    planned_start_at: '2026-03-22T01:00:00.000Z',
    planned_end_at: '2026-03-22T09:00:00.000Z',
    actual_start_at: null,
    actual_end_at: null,
    status: 'planned',
    updated_at: null,
  },
};

export function readSeedWorkTime(scheduleId: string) {
  return seededWorkTimeByScheduleId[scheduleId] ?? null;
}

export function saveSeedWorkTime(
  scheduleId: string,
  input: {
    planned_start_at: string | null;
    planned_end_at: string | null;
    actual_start_at: string | null;
    actual_end_at: string | null;
    status: 'planned' | 'actual_recorded' | 'corrected';
  },
) {
  seededWorkTimeByScheduleId = {
    ...seededWorkTimeByScheduleId,
    [scheduleId]: {
      ...input,
      updated_at: new Date().toISOString(),
    },
  };
}
