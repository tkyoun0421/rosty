import {
  buildScheduleTitle,
  canCancelScheduleOperation,
  filterScheduleListItems,
  formatCollectionState,
  formatScheduleStatus,
} from '@/features/schedules/model/schedules';

describe('schedule read helpers', () => {
  it('uses memo when building a schedule title', () => {
    expect(
      buildScheduleTitle({
        eventDate: '2026-03-22',
        memo: 'Grand Hall wedding',
        packageCount: 4,
      }),
    ).toBe('2026-03-22 · Grand Hall wedding');
  });

  it('falls back to package count when memo is empty', () => {
    expect(
      buildScheduleTitle({
        eventDate: '2026-03-22',
        memo: null,
        packageCount: 4,
      }),
    ).toBe('2026-03-22 · 4 packages');
  });

  it('formats status and collection state labels', () => {
    expect(formatScheduleStatus('collecting')).toBe('Collecting');
    expect(formatCollectionState('locked')).toBe('Locked');
  });

  it('allows schedule cancellation only for collecting or assigned schedules', () => {
    expect(canCancelScheduleOperation('collecting')).toBe(true);
    expect(canCancelScheduleOperation('assigned')).toBe(true);
    expect(canCancelScheduleOperation('completed')).toBe(false);
    expect(canCancelScheduleOperation('cancelled')).toBe(false);
  });

  it('filters the schedule list by top tab and collection chip', () => {
    const items = [
      {
        id: 'schedule-1',
        title: '2026-03-22 · Grand Hall wedding',
        eventDate: '2026-03-22',
        packageCount: 4,
        status: 'collecting' as const,
        collectionState: 'open' as const,
        enabledSlotCount: 2,
      },
      {
        id: 'schedule-2',
        title: '2026-03-23 · Garden Hall reception',
        eventDate: '2026-03-23',
        packageCount: 2,
        status: 'assigned' as const,
        collectionState: 'locked' as const,
        enabledSlotCount: 3,
      },
      {
        id: 'schedule-3',
        title: '2026-03-24 · Convention Hall banquet',
        eventDate: '2026-03-24',
        packageCount: 3,
        status: 'completed' as const,
        collectionState: 'locked' as const,
        enabledSlotCount: 1,
      },
    ];

    expect(
      filterScheduleListItems({
        items,
        tab: 'collecting',
        collection: 'all',
        dateRange: 'all',
        query: '',
      }),
    ).toHaveLength(1);
    expect(
      filterScheduleListItems({
        items,
        tab: 'closed',
        collection: 'locked',
        dateRange: 'all',
        query: '',
      }),
    ).toHaveLength(1);
    expect(
      filterScheduleListItems({
        items,
        tab: 'assigned',
        collection: 'open',
        dateRange: 'all',
        query: '',
      }),
    ).toHaveLength(0);
  });

  it('filters the schedule list by date range and local query', () => {
    const items = [
      {
        id: 'schedule-1',
        title: '2026-03-22 · Grand Hall wedding',
        eventDate: '2026-03-22',
        packageCount: 4,
        status: 'collecting' as const,
        collectionState: 'open' as const,
        enabledSlotCount: 2,
      },
      {
        id: 'schedule-2',
        title: '2026-03-29 · Garden Hall reception',
        eventDate: '2026-03-29',
        packageCount: 2,
        status: 'assigned' as const,
        collectionState: 'locked' as const,
        enabledSlotCount: 3,
      },
      {
        id: 'schedule-3',
        title: '2026-03-18 · Convention Hall banquet',
        eventDate: '2026-03-18',
        packageCount: 3,
        status: 'completed' as const,
        collectionState: 'locked' as const,
        enabledSlotCount: 1,
      },
    ];

    expect(
      filterScheduleListItems({
        items,
        tab: 'all',
        collection: 'all',
        dateRange: 'next_7_days',
        query: '',
        today: '2026-03-22',
      }).map((item) => item.id),
    ).toEqual(['schedule-1', 'schedule-2']);

    expect(
      filterScheduleListItems({
        items,
        tab: 'all',
        collection: 'all',
        dateRange: 'past',
        query: '',
        today: '2026-03-22',
      }).map((item) => item.id),
    ).toEqual(['schedule-3']);

    expect(
      filterScheduleListItems({
        items,
        tab: 'all',
        collection: 'all',
        dateRange: 'all',
        query: 'garden',
        today: '2026-03-22',
      }).map((item) => item.id),
    ).toEqual(['schedule-2']);
  });
});
