import {
  canSubmitAvailability,
  formatAvailabilityResponseState,
} from '@/features/availability/model/availability-submission';

describe('availability submission helpers', () => {
  it('allows active employee responses only while collection is open', () => {
    expect(
      canSubmitAvailability({
        role: 'employee',
        scheduleStatus: 'collecting',
        collectionState: 'open',
      }),
    ).toBe(true);

    expect(
      canSubmitAvailability({
        role: 'employee',
        scheduleStatus: 'collecting',
        collectionState: 'locked',
      }),
    ).toBe(false);
  });

  it('formats response labels', () => {
    expect(formatAvailabilityResponseState('not_responded')).toBe(
      'Not responded',
    );
  });
});
