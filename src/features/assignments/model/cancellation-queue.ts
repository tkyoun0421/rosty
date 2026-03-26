import type { CancellationQueueItem } from '@/features/assignments/api/fetch-cancellation-queue';

export type CancellationQueueTab = 'pending' | 'reviewed';
export type CancellationQueueStatusChip = 'all' | 'approved' | 'rejected';

export function filterCancellationQueueItems(input: {
  items: CancellationQueueItem[];
  tab: CancellationQueueTab;
  statusChip: CancellationQueueStatusChip;
  query?: string;
}): CancellationQueueItem[] {
  const normalizedQuery = input.query?.trim().toLowerCase() ?? '';

  return input.items.filter((item) => {
    const tabMatch =
      input.tab === 'pending'
        ? item.status === 'requested'
        : item.status === 'approved' || item.status === 'rejected';
    const chipMatch =
      input.tab === 'pending' ||
      input.statusChip === 'all' ||
      item.status === input.statusChip;
    const queryMatch =
      normalizedQuery.length === 0
        ? true
        : `${item.requesterName} ${item.scheduleTitle} ${item.positionName} ${item.reason}`
            .toLowerCase()
            .includes(normalizedQuery);

    return tabMatch && chipMatch && queryMatch;
  });
}
