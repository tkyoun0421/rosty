import {
  canCompleteScheduleOperation,
  createWorkTimeFormValues,
  formatWorkTimeStatus,
  formatWorkTimeValue,
  validateWorkTimeForm,
} from '@/features/work-time/model/work-time';

describe('work time helpers', () => {
  it('creates empty form values when no record exists', () => {
    expect(createWorkTimeFormValues(null)).toEqual({
      plannedStartAt: '',
      plannedEndAt: '',
      actualStartAt: '',
      actualEndAt: '',
    });
  });

  it('validates paired planned/actual inputs and derives status', () => {
    const result = validateWorkTimeForm({
      plannedStartAt: '2026-03-22T10:00:00.000Z',
      plannedEndAt: '2026-03-22T18:00:00.000Z',
      actualStartAt: '2026-03-22T10:10:00.000Z',
      actualEndAt: '2026-03-22T18:20:00.000Z',
    });

    expect(result.status).toBe('actual_recorded');
    expect(result.errors).toEqual({});
  });

  it('rejects end times before start times', () => {
    const result = validateWorkTimeForm({
      plannedStartAt: '2026-03-22T10:00:00.000Z',
      plannedEndAt: '2026-03-22T09:00:00.000Z',
      actualStartAt: '',
      actualEndAt: '',
    });

    expect(result.errors.plannedEndAt).toBe(
      'Planned end time must be after planned start time.',
    );
  });

  it('allows completion only for assigned schedules with actual start and end times', () => {
    expect(
      canCompleteScheduleOperation({
        scheduleStatus: 'assigned',
        actualStartAt: '2026-03-22T10:10:00.000Z',
        actualEndAt: '2026-03-22T18:20:00.000Z',
      }),
    ).toBe(true);
    expect(
      canCompleteScheduleOperation({
        scheduleStatus: 'assigned',
        actualStartAt: '2026-03-22T10:10:00.000Z',
        actualEndAt: null,
      }),
    ).toBe(false);
    expect(
      canCompleteScheduleOperation({
        scheduleStatus: 'completed',
        actualStartAt: '2026-03-22T10:10:00.000Z',
        actualEndAt: '2026-03-22T18:20:00.000Z',
      }),
    ).toBe(false);
  });

  it('formats read-only work-time status and nullable values', () => {
    expect(formatWorkTimeStatus('actual_recorded')).toBe('Actual recorded');
    expect(formatWorkTimeValue('2026-03-22T10:10:00.000Z')).toBe(
      '2026-03-22T10:10:00.000Z',
    );
    expect(formatWorkTimeValue(null)).toBe('Not recorded');
  });
});
