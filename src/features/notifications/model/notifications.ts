export type NotificationItem = {
  id: string;
  type:
    | 'user_approved'
    | 'schedule_created'
    | 'schedule_cancelled'
    | 'assignment_confirmed'
    | 'cancellation_requested'
    | 'cancellation_approved'
    | 'cancellation_rejected';
  title: string;
  body: string;
  targetRoute: string;
  targetId: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationTab = 'unread' | 'all';

export function filterNotifications(
  notifications: NotificationItem[],
  tab: NotificationTab,
): NotificationItem[] {
  return tab === 'all'
    ? notifications
    : notifications.filter((notification) => !notification.isRead);
}

export function countUnreadNotifications(
  notifications: NotificationItem[],
): number {
  return notifications.filter((notification) => !notification.isRead).length;
}
