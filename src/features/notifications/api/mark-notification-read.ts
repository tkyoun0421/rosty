import { supabaseClient } from '@/shared/lib/supabase/client';

type MarkNotificationReadInput = {
  notificationId: string;
  userId: string;
};

export async function markNotificationRead(
  input: MarkNotificationReadInput,
): Promise<void> {
  if (!supabaseClient) {
    return;
  }

  const { error } = await supabaseClient
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', input.notificationId)
    .eq('user_id', input.userId);

  if (error) {
    throw new Error(error.message);
  }
}
