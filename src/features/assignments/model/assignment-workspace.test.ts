import { createAssignmentWorkspaceSnapshot } from '@/features/assignments/model/assignment-workspace';

describe('assignment workspace snapshot', () => {
  it('builds seat rows from current assignments and candidate groups from responses', () => {
    const snapshot = createAssignmentWorkspaceSnapshot({
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
          headcount: 2,
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
      ],
      assignments: [
        {
          id: 'assignment-1',
          slotId: 'slot-1',
          status: 'proposed',
          assigneeUserId: 'employee-1',
          assigneeName: 'Mina Staff',
          guestName: null,
        },
      ],
    });

    expect(snapshot?.slots[0]?.seats).toHaveLength(2);
    expect(snapshot?.slots[0]?.availableCandidates).toHaveLength(1);
    expect(snapshot?.slots[0]?.vacancyCount).toBe(1);
    expect(snapshot?.canConfirm).toBe(true);
  });

  it('disables edit/confirm when the schedule is already assigned', () => {
    const snapshot = createAssignmentWorkspaceSnapshot({
      schedule: {
        id: 'schedule-1',
        title: '2026-03-22 · Grand Hall wedding',
        eventDate: '2026-03-22',
        scheduleStatus: 'assigned',
        collectionState: 'locked',
      },
      slots: [],
      employees: [],
      submissions: [],
      assignments: [],
    });

    expect(snapshot?.canEdit).toBe(false);
    expect(snapshot?.canConfirm).toBe(false);
  });
});
