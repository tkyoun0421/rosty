import { useQuery } from '@tanstack/react-query';

import type { AuthSession } from '@/features/auth/model/auth-types';
import {
  assignmentRequestSeedSource,
  myAssignmentsSeedSource,
} from '@/features/assignments/api/assignment-read-fallback';
import {
  hasSupabaseConfig,
  supabaseClient,
} from '@/shared/lib/supabase/client';
import type { NotificationItem } from '@/features/notifications/model/notifications';

export type NotificationsSnapshot = {
  source: 'seed' | 'supabase';
  sourceMessage: string | null;
  items: NotificationItem[];
};

type NotificationRow = {
  id: string;
  type: NotificationItem['type'];
  title: string;
  body: string;
  target_route: string;
  target_id: string | null;
  is_read: boolean;
  created_at: string;
};

export function notificationsQueryKey(userId: string) {
  return ['notifications', userId] as const;
}

function createSeedNotifications(session: AuthSession): NotificationsSnapshot {
  if (session.role === 'employee') {
    return {
      source: 'seed',
      sourceMessage:
        'The notifications schema is not ready yet, so the inbox is showing a local seeded snapshot.',
      items: [
        {
          id: 'seed-notification-employee-1',
          type: 'cancellation_approved',
          title: 'Cancellation approved',
          body: 'Your cancellation request was approved.',
          targetRoute: '/assignment-detail?scheduleId=schedule-3',
          targetId: 'assignment-4',
          isRead: false,
          createdAt: '2026-03-20T11:00:00.000Z',
        },
      ],
    };
  }

  const seedRequest = assignmentRequestSeedSource[0];
  const seedSchedule = myAssignmentsSeedSource.schedules.find(
    (schedule) => schedule.id === 'schedule-3',
  );

  return {
    source: 'seed',
    sourceMessage:
      'The notifications schema is not ready yet, so the inbox is showing a local seeded snapshot.',
    items: [
      {
        id: 'seed-notification-manager-1',
        type: 'cancellation_requested',
        title: 'Cancellation request waiting',
        body: `${seedRequest.reason} (${seedSchedule?.memo ?? 'Convention Hall banquet'})`,
        targetRoute: '/cancellation-queue',
        targetId: seedRequest.assignmentId,
        isRead: false,
        createdAt: '2026-03-20T11:00:00.000Z',
      },
    ],
  };
}

async function fetchLiveNotifications(
  session: AuthSession,
): Promise<NotificationsSnapshot> {
  if (!supabaseClient) {
    return createSeedNotifications(session);
  }

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseClient
    .from('notifications')
    .select('id, type, title, body, target_route, target_id, is_read, created_at')
    .eq('user_id', session.userId)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: false })
    .returns<NotificationRow[]>();

  if (error) {
    return createSeedNotifications(session);
  }

  return {
    source: 'supabase',
    sourceMessage: null,
    items: (data ?? []).map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      targetRoute: notification.target_route,
      targetId: notification.target_id,
      isRead: notification.is_read,
      createdAt: notification.created_at,
    })),
  };
}

export async function fetchNotifications(
  session: AuthSession,
): Promise<NotificationsSnapshot> {
  await Promise.resolve();

  if (!hasSupabaseConfig) {
    return createSeedNotifications(session);
  }

  return fetchLiveNotifications(session);
}

export function useNotificationsQuery(session: AuthSession | null) {
  return useQuery({
    queryKey: session ? notificationsQueryKey(session.userId) : ['notifications'],
    queryFn: () => fetchNotifications(session as AuthSession),
    enabled: !!session && session.status === 'active',
    staleTime: 30_000,
  });
}
