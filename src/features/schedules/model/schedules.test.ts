import {
  buildScheduleTitle,
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
});
