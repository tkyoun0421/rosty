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
    expect(
      filterNotifications({
        notifications,
        tab: 'unread',
        category: 'all',
        query: '',
      }),
    ).toHaveLength(1);
  });

  it('counts unread notifications', () => {
    expect(countUnreadNotifications(notifications)).toBe(1);
  });

  it('filters notifications by category and local query', () => {
    const richerNotifications = [
      ...notifications,
      {
        id: 'notification-3',
        type: 'schedule_created' as const,
        title: 'Schedule created',
        body: 'A new banquet schedule was created.',
        targetRoute: '/schedule-detail?scheduleId=schedule-2',
        targetId: 'schedule-2',
        isRead: false,
        createdAt: '2026-03-20T08:00:00.000Z',
      },
    ];

    expect(
      filterNotifications({
        notifications: richerNotifications,
        tab: 'all',
        category: 'schedule',
        query: '',
      }),
    ).toHaveLength(1);

    expect(
      filterNotifications({
        notifications: richerNotifications,
        tab: 'all',
        category: 'all',
        query: 'banquet',
      }),
    ).toHaveLength(1);
  });
});
