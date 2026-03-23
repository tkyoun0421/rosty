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
    const createdSchedule = myAssignmentsSeedSource.schedules.find(
      (schedule) => schedule.id === 'schedule-3',
    );
    const confirmedSchedule = myAssignmentsSeedSource.schedules.find(
      (schedule) => schedule.id === 'schedule-1',
    );

    return {
      source: 'seed',
      sourceMessage:
        'The notifications schema is not ready yet, so the inbox is showing a local seeded snapshot.',
      items: [
        {
          id: 'seed-notification-employee-1',
          type: 'user_approved',
          title: 'Access approved',
          body: 'Your access was approved. You can now enter Rosty.',
          targetRoute: '/employee-home',
          targetId: null,
          isRead: true,
          createdAt: '2026-03-19T09:00:00.000Z',
        },
        {
          id: 'seed-notification-employee-2',
          type: 'schedule_created',
          title: 'Schedule created',
          body: `A new schedule for ${createdSchedule?.eventDate ?? '2026-03-29'} · ${createdSchedule?.memo ?? 'Convention Hall banquet'} was created.`,
          targetRoute: '/schedule-detail?scheduleId=schedule-3',
          targetId: 'schedule-3',
          isRead: false,
          createdAt: '2026-03-21T08:00:00.000Z',
        },
        {
          id: 'seed-notification-employee-3',
          type: 'assignment_confirmed',
          title: 'Assignment confirmed',
          body: `Your assignment for ${confirmedSchedule?.eventDate ?? '2026-03-22'} · ${confirmedSchedule?.memo ?? 'Grand Hall wedding'} was confirmed.`,
          targetRoute: '/assignment-detail?scheduleId=schedule-1',
          targetId: 'schedule-1',
          isRead: false,
          createdAt: '2026-03-21T09:00:00.000Z',
        },
        {
          id: 'seed-notification-employee-4',
          type: 'schedule_cancelled',
          title: 'Schedule cancelled',
          body: `The schedule for ${createdSchedule?.eventDate ?? '2026-03-29'} · ${createdSchedule?.memo ?? 'Convention Hall banquet'} was cancelled. Your assignment was removed.`,
          targetRoute: '/schedule-detail?scheduleId=schedule-3',
          targetId: 'schedule-3',
          isRead: false,
          createdAt: '2026-03-20T12:00:00.000Z',
        },
        {
          id: 'seed-notification-employee-5',
          type: 'cancellation_approved',
          title: 'Cancellation approved',
          body: 'Your cancellation request was approved.',
          targetRoute: '/assignment-detail?scheduleId=schedule-3',
          targetId: 'assignment-4',
          isRead: true,
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
