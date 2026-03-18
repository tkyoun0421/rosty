import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/model/auth-store';
import { supabaseClient } from '@/shared/lib/supabase/client';

export function AuthBootstrap() {
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const syncSessionFromAuthChange = useAuthStore(
    (state) => state.syncSessionFromAuthChange,
  );

  useEffect(() => {
    void restoreSession();

    if (!supabaseClient) {
      return;
    }

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      void syncSessionFromAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [restoreSession, syncSessionFromAuthChange]);

  return null;
}
