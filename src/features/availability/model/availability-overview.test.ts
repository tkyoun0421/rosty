import {
  createAvailabilityOverviewSnapshot,
  formatAvailabilityOverviewResponseState,
} from '@/features/availability/model/availability-overview';

describe('availability overview snapshot', () => {
  it('filters candidates by required gender and splits primary/support groups', () => {
    const snapshot = createAvailabilityOverviewSnapshot({
      schedule: {
        id: 'schedule-1',
        title: '2026-03-22 · Grand Hall wedding',
        eventDate: '2026-03-22',
        scheduleStatus: 'collecting',
        collectionState: 'open',
      },
      slots: [
        {
          id: 'slot-1',
          positionName: 'Bride room',
          headcount: 1,
          requiredGender: 'female',
          isEnabled: true,
        },
      ],
      employees: [
        {
          id: 'employee-1',
          fullName: 'Mina Staff',
          gender: 'female',
        },
        {
          id: 'employee-2',
          fullName: 'Joon Staff',
          gender: 'male',
        },
      ],
      submissions: [
        {
          userId: 'employee-1',
          status: 'available',
        },
        {
          userId: 'employee-2',
          status: 'available',
        },
      ],
    });

    expect(snapshot?.slots[0]?.availableCandidates).toHaveLength(1);
    expect(snapshot?.slots[0]?.availableCandidates[0]?.fullName).toBe('Mina Staff');
    expect(snapshot?.slots[0]?.supportCandidates).toHaveLength(0);
  });

  it('treats missing submissions as no response and reports vacancies', () => {
    const snapshot = createAvailabilityOverviewSnapshot({
      schedule: {
        id: 'schedule-1',
        title: '2026-03-22 · Grand Hall wedding',
        eventDate: '2026-03-22',
        scheduleStatus: 'collecting',
        collectionState: 'open',
      },
      slots: [
        {
          id: 'slot-1',
          positionName: 'Reception',
          headcount: 2,
          requiredGender: 'any',
          isEnabled: true,
        },
      ],
      employees: [
        {
          id: 'employee-1',
          fullName: 'Mina Staff',
          gender: 'female',
        },
      ],
      submissions: [],
    });

    expect(snapshot?.slots[0]?.supportCandidates[0]?.responseState).toBe(
      'not_responded',
    );
    expect(snapshot?.slots[0]?.vacancyCount).toBe(2);
    expect(formatAvailabilityOverviewResponseState('not_responded')).toBe(
      'No response',
    );
  });
});
