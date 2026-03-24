export type NotificationItem = {
  id: string;
  type:
    | 'user_approved'
    | 'user_suspended'
    | 'user_reactivated'
    | 'schedule_created'
    | 'schedule_updated'
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
export type NotificationCategoryChip =
  | 'all'
  | 'access'
  | 'schedule'
  | 'assignment'
  | 'cancellation';

function matchesNotificationCategory(
  notification: NotificationItem,
  category: NotificationCategoryChip,
): boolean {
  switch (category) {
    case 'all':
      return true;
    case 'access':
      return (
        notification.type === 'user_approved' ||
        notification.type === 'user_suspended' ||
        notification.type === 'user_reactivated'
      );
    case 'schedule':
      return (
        notification.type === 'schedule_created' ||
        notification.type === 'schedule_updated' ||
        notification.type === 'schedule_cancelled'
      );
    case 'assignment':
      return notification.type === 'assignment_confirmed';
    case 'cancellation':
      return (
        notification.type === 'cancellation_requested' ||
        notification.type === 'cancellation_approved' ||
        notification.type === 'cancellation_rejected'
      );
  }
}

export function filterNotifications(input: {
  notifications: NotificationItem[];
  tab: NotificationTab;
  category?: NotificationCategoryChip;
  query?: string;
}): NotificationItem[] {
  const normalizedQuery = input.query?.trim().toLowerCase() ?? '';

  return input.notifications.filter((notification) => {
    const tabMatch = input.tab === 'all' ? true : !notification.isRead;
    const categoryMatch = matchesNotificationCategory(
      notification,
      input.category ?? 'all',
    );
    const queryMatch =
      normalizedQuery.length === 0
        ? true
        : `${notification.title} ${notification.body}`
            .toLowerCase()
            .includes(normalizedQuery);

    return tabMatch && categoryMatch && queryMatch;
  });
}

export function countUnreadNotifications(
  notifications: NotificationItem[],
): number {
  return notifications.filter((notification) => !notification.isRead).length;
}
