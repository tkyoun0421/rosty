import {
  canRequestCancellation,
  createAssignmentDetailSnapshot,
  formatCancellationRequestStatus,
} from '@/features/assignments/model/assignment-detail';

describe('assignment detail snapshot', () => {
  it('marks only confirmed future assignments as cancellable', () => {
    const snapshot = createAssignmentDetailSnapshot(
      {
        schedule: {
          id: 'schedule-1',
          eventDate: '2026-03-22',
          memo: 'Grand Hall wedding',
          packageCount: 4,
        },
        positions: [
          {
            assignmentId: 'assignment-1',
            slotId: 'slot-1',
            positionName: 'Bride room',
            status: 'confirmed',
            cancellationRequest: null,
          },
          {
            assignmentId: 'assignment-2',
            slotId: 'slot-2',
            positionName: 'Reception',
            status: 'cancel_requested',
            cancellationRequest: {
              status: 'requested',
              reason: 'Family emergency',
            },
          },
        ],
      },
      'schedule-1',
      '2026-03-20',
    );

    expect(snapshot?.positions[0]?.positionName).toBe('Bride room');
    expect(snapshot?.positions[0]?.canRequestCancellation).toBe(true);
    expect(snapshot?.positions[1]?.canRequestCancellation).toBe(false);
  });

  it('blocks cancellation requests after the event date', () => {
    expect(canRequestCancellation('confirmed', '2026-03-19', '2026-03-20')).toBe(
      false,
    );
  });

  it('formats cancellation request status labels', () => {
    expect(formatCancellationRequestStatus('requested')).toBe('Requested');
  });
});
