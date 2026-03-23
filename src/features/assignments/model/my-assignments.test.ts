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
        query: '',
        sort: 'event_date',
      }),
    ).toHaveLength(1);
    expect(
      filterMyAssignmentSchedules({
        snapshot,
        tab: 'past',
        status: 'completed',
        query: '',
        sort: 'event_date',
      }),
    ).toHaveLength(1);
    expect(
      filterMyAssignmentSchedules({
        snapshot,
        tab: 'past',
        status: 'confirmed',
        query: '',
        sort: 'event_date',
      }),
    ).toHaveLength(0);
  });

  it('supports local query matching and status-first sorting', () => {
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
            status: 'cancel_requested',
          },
          {
            id: 'assignment-3',
            scheduleId: 'schedule-3',
            slotId: 'slot-3',
            status: 'completed',
          },
        ],
        schedules: [
          {
            id: 'schedule-1',
            eventDate: '2026-03-22',
            memo: 'Grand Hall wedding',
            packageCount: 4,
          },
          {
            id: 'schedule-2',
            eventDate: '2026-03-24',
            memo: 'Garden Hall reception',
            packageCount: 2,
          },
          {
            id: 'schedule-3',
            eventDate: '2026-03-25',
            memo: 'Convention Hall banquet',
            packageCount: 3,
          },
        ],
        slots: [
          { id: 'slot-1', positionName: 'Bride room' },
          { id: 'slot-2', positionName: 'Banquet' },
          { id: 'slot-3', positionName: 'Guest hall' },
        ],
      },
      '2026-03-20',
    );

    expect(
      filterMyAssignmentSchedules({
        snapshot,
        tab: 'upcoming',
        status: 'all',
        query: 'banquet',
        sort: 'event_date',
      }).map((schedule) => schedule.scheduleId),
    ).toEqual(['schedule-2', 'schedule-3']);

    expect(
      filterMyAssignmentSchedules({
        snapshot,
        tab: 'upcoming',
        status: 'all',
        query: '',
        sort: 'status',
      }).map((schedule) => schedule.scheduleId),
    ).toEqual(['schedule-2', 'schedule-1', 'schedule-3']);
  });
});
