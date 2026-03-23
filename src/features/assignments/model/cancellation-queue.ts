import type { CancellationQueueItem } from '@/features/assignments/api/fetch-cancellation-queue';

export type CancellationQueueTab = 'pending' | 'reviewed';
export type CancellationQueueStatusChip = 'all' | 'approved' | 'rejected';

export function filterCancellationQueueItems(input: {
  items: CancellationQueueItem[];
  tab: CancellationQueueTab;
  statusChip: CancellationQueueStatusChip;
}): CancellationQueueItem[] {
  return input.items.filter((item) => {
    const tabMatch =
      input.tab === 'pending'
        ? item.status === 'requested'
        : item.status === 'approved' || item.status === 'rejected';
    const chipMatch =
      input.tab === 'pending' ||
      input.statusChip === 'all' ||
      item.status === input.statusChip;

    return tabMatch && chipMatch;
  });
}
