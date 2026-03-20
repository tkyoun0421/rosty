import {
  countUnreadNotifications,
  filterNotifications,
} from '@/features/notifications/model/notifications';

const notifications = [
  {
    id: 'notification-1',
    type: 'cancellation_requested' as const,
    title: 'Cancellation request waiting',
    body: 'A request is waiting.',
    targetRoute: '/cancellation-queue',
    targetId: 'assignment-1',
    isRead: false,
    createdAt: '2026-03-20T10:00:00.000Z',
  },
  {
    id: 'notification-2',
    type: 'cancellation_approved' as const,
    title: 'Cancellation approved',
    body: 'Your request was approved.',
    targetRoute: '/assignment-detail?scheduleId=schedule-1',
    targetId: 'assignment-1',
    isRead: true,
    createdAt: '2026-03-20T09:00:00.000Z',
  },
];

describe('notifications model helpers', () => {
  it('filters unread notifications', () => {
    expect(filterNotifications(notifications, 'unread')).toHaveLength(1);
  });

  it('counts unread notifications', () => {
    expect(countUnreadNotifications(notifications)).toBe(1);
  });
});
