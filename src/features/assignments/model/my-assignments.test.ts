import {
  createMyAssignmentsSnapshot,
  filterMyAssignmentSchedules,
  formatAssignmentStatus,
} from '@/features/assignments/model/my-assignments';

describe('createMyAssignmentsSnapshot', () => {
  it('groups same-schedule positions into one employee card', () => {
    const snapshot = createMyAssignmentsSnapshot(
      {
        assignments: [
          {
            id: 'assignment-1',
            scheduleId: 'schedule-1',
            slotId: 'slot-1',
            status: 'confirmed',
          },
          {
            id: 'assignment-2',
            scheduleId: 'schedule-1',
            slotId: 'slot-2',
            status: 'confirmed',
          },
        ],
        schedules: [
          {
            id: 'schedule-1',
            eventDate: '2026-03-22',
            memo: 'Grand Hall wedding',
            packageCount: 4,
          },
        ],
        slots: [
          { id: 'slot-1', positionName: 'Bride room' },
          { id: 'slot-2', positionName: 'Guest hall' },
        ],
      },
      '2026-03-20',
    );

    expect(snapshot.upcoming).toHaveLength(1);
    expect(snapshot.upcoming[0]?.positions).toEqual([
      'Bride room',
      'Guest hall',
    ]);
  });

  it('splits upcoming and past schedules by event date', () => {
    const snapshot = createMyAssignmentsSnapshot(
      {
        assignments: [
          {
            id: 'assignment-1',
            scheduleId: 'schedule-1',
            slotId: 'slot-1',
            status: 'confirmed',
          },
          {
            id: 'assignment-2',
            scheduleId: 'schedule-2',
            slotId: 'slot-2',
            status: 'completed',
          },
        ],
        schedules: [
          {
            id: 'schedule-1',
            eventDate: '2026-03-22',
            memo: null,
            packageCount: 4,
          },
          {
            id: 'schedule-2',
            eventDate: '2026-03-12',
            memo: null,
            packageCount: 2,
          },
        ],
        slots: [
          { id: 'slot-1', positionName: 'Bride room' },
          { id: 'slot-2', positionName: 'Banquet' },
        ],
      },
      '2026-03-20',
    );

    expect(snapshot.upcoming).toHaveLength(1);
    expect(snapshot.past).toHaveLength(1);
    expect(snapshot.upcoming[0]?.scheduleId).toBe('schedule-1');
    expect(snapshot.past[0]?.scheduleId).toBe('schedule-2');
  });

  it('keeps the highest-priority grouped status', () => {
    const snapshot = createMyAssignmentsSnapshot(
      {
        assignments: [
          {
            id: 'assignment-1',
            scheduleId: 'schedule-1',
            slotId: 'slot-1',
            status: 'confirmed',
          },
          {
            id: 'assignment-2',
            scheduleId: 'schedule-1',
            slotId: 'slot-2',
            status: 'cancel_requested',
          },
        ],
        schedules: [
          {
            id: 'schedule-1',
            eventDate: '2026-03-22',
            memo: null,
            packageCount: 4,
          },
        ],
        slots: [
          { id: 'slot-1', positionName: 'Bride room' },
          { id: 'slot-2', positionName: 'Guest hall' },
        ],
      },
      '2026-03-20',
    );

    expect(snapshot.upcoming[0]?.status).toBe('cancel_requested');
    expect(formatAssignmentStatus('cancel_requested')).toBe('Cancel requested');
  });

  it('filters grouped schedules by tab and status chip', () => {
    const snapshot = createMyAssignmentsSnapshot(
      {
        assignments: [
          {
            id: 'assignment-1',
            scheduleId: 'schedule-1',
            slotId: 'slot-1',
            status: 'confirmed',
          },
          {
            id: 'assignment-2',
            scheduleId: 'schedule-2',
            slotId: 'slot-2',
            status: 'completed',
          },
        ],
        schedules: [
          {
            id: 'schedule-1',
            eventDate: '2026-03-22',
            memo: null,
            packageCount: 4,
          },
          {
            id: 'schedule-2',
            eventDate: '2026-03-12',
            memo: null,
            packageCount: 2,
          },
        ],
        slots: [
          { id: 'slot-1', positionName: 'Bride room' },
          { id: 'slot-2', positionName: 'Banquet' },
        ],
      },
      '2026-03-20',
    );

    expect(
      filterMyAssignmentSchedules({
        snapshot,
        tab: 'upcoming',
        status: 'confirmed',
      }),
    ).toHaveLength(1);
    expect(
      filterMyAssignmentSchedules({
        snapshot,
        tab: 'past',
        status: 'completed',
      }),
    ).toHaveLength(1);
    expect(
      filterMyAssignmentSchedules({
        snapshot,
        tab: 'past',
        status: 'confirmed',
      }),
    ).toHaveLength(0);
  });
});
