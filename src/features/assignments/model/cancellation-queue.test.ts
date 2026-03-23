import { filterCancellationQueueItems } from '@/features/assignments/model/cancellation-queue';

describe('filterCancellationQueueItems', () => {
  const items = [
    {
      requestId: 'request-1',
      assignmentId: 'assignment-1',
      requesterName: 'Mina Staff',
      scheduleId: 'schedule-1',
      scheduleTitle: '2026-03-22 · Grand Hall wedding',
      eventDate: '2026-03-22',
      positionName: 'Bride room',
      reason: 'Family emergency',
      status: 'requested' as const,
    },
    {
      requestId: 'request-2',
      assignmentId: 'assignment-2',
      requesterName: 'Sera Staff',
      scheduleId: 'schedule-2',
      scheduleTitle: '2026-03-21 · Garden Hall reception',
      eventDate: '2026-03-21',
      positionName: 'Banquet',
      reason: 'Reviewed approval',
      status: 'approved' as const,
    },
    {
      requestId: 'request-3',
      assignmentId: 'assignment-3',
      requesterName: 'Joon Staff',
      scheduleId: 'schedule-3',
      scheduleTitle: '2026-03-20 · Convention Hall banquet',
      eventDate: '2026-03-20',
      positionName: 'Reception',
      reason: 'Reviewed rejection',
      status: 'rejected' as const,
    },
  ];

  it('splits pending and reviewed queue items by tab', () => {
    expect(
      filterCancellationQueueItems({
        items,
        tab: 'pending',
        statusChip: 'all',
      }),
    ).toHaveLength(1);
    expect(
      filterCancellationQueueItems({
        items,
        tab: 'reviewed',
        statusChip: 'all',
      }),
    ).toHaveLength(2);
  });

  it('filters reviewed queue items by status chip', () => {
    expect(
      filterCancellationQueueItems({
        items,
        tab: 'reviewed',
        statusChip: 'approved',
      }),
    ).toHaveLength(1);
    expect(
      filterCancellationQueueItems({
        items,
        tab: 'reviewed',
        statusChip: 'rejected',
      }),
    ).toHaveLength(1);
  });
});
