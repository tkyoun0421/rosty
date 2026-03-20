import { useMutation } from '@tanstack/react-query';

import { markNotificationRead } from '@/features/notifications/api/mark-notification-read';
import { notificationsQueryKey } from '@/features/notifications/api/fetch-notifications';
import { queryClient } from '@/shared/lib/react-query/query-client';

export function useNotificationReadMutation(userId: string) {
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationsQueryKey(userId),
      });
    },
  });
}
