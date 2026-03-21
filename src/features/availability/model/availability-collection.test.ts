import {
  canManageAvailabilityCollection,
  getAvailabilityCollectionActionLabel,
  getNextAvailabilityCollectionState,
} from '@/features/availability/model/availability-collection';

describe('availability collection helpers', () => {
  it('allows only manager/admin collection management while schedules are collecting', () => {
    expect(
      canManageAvailabilityCollection({
        role: 'manager',
        scheduleStatus: 'collecting',
      }),
    ).toBe(true);
    expect(
      canManageAvailabilityCollection({
        role: 'admin',
        scheduleStatus: 'collecting',
      }),
    ).toBe(true);
    expect(
      canManageAvailabilityCollection({
        role: 'employee',
        scheduleStatus: 'collecting',
      }),
    ).toBe(false);
    expect(
      canManageAvailabilityCollection({
        role: 'manager',
        scheduleStatus: 'assigned',
      }),
    ).toBe(false);
  });

  it('toggles and labels the next collection action from the current state', () => {
    expect(getNextAvailabilityCollectionState('open')).toBe('locked');
    expect(getNextAvailabilityCollectionState('locked')).toBe('open');
    expect(getAvailabilityCollectionActionLabel('open')).toBe(
      'Lock collection',
    );
    expect(getAvailabilityCollectionActionLabel('locked')).toBe(
      'Reopen collection',
    );
  });
});
