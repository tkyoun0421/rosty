import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import {
  extractInvitationToken,
  extractOAuthCode,
  startGoogleOAuth,
} from '@/features/auth/lib/google-oauth';
import {
  approveSession,
  completeProfileSession,
  createDemoSession,
  reactivateSession,
  suspendSession,
} from '@/features/auth/model/auth-rules';
import { resolveSupabaseAuthSession } from '@/features/auth/model/auth-session';
import type {
  AuthSession,
  AuthSource,
  DemoAuthPreset,
} from '@/features/auth/model/auth-types';
import { queryClient } from '@/shared/lib/react-query/query-client';
import {
  hasSupabaseConfig,
  supabaseClient,
} from '@/shared/lib/supabase/client';

type AuthStore = {
  isHydrated: boolean;
  isAuthenticating: boolean;
  session: AuthSession | null;
  authSource: AuthSource | null;
  pendingInvitationToken: string | null;
  processingOAuthCode: string | null;
  handledOAuthCode: string | null;
  errorMessage: string | null;
  clearError: () => void;
  setPendingInvitationToken: (token: string | null) => void;
  clearPendingInvitationToken: () => void;
  restoreSession: () => Promise<void>;
  syncSessionFromAuthChange: (session: Session | null) => Promise<void>;
  completeOAuthRedirect: (url: string) => Promise<boolean>;
  signInWithGoogle: (invitationToken?: string | null) => Promise<void>;
  signInWithDemo: (preset: DemoAuthPreset) => void;
  completeProfile: () => void;
  approveAccess: () => void;
  suspendAccess: () => void;
  reactivateAccess: () => void;
  signOut: () => Promise<void>;
};

async function resolveStoreSession(session: Session | null): Promise<{
  session: AuthSession | null;
  authSource: AuthSource | null;
}> {
  if (!session?.user) {
    return {
      session: null,
      authSource: null,
    };
  }

  return {
    session: await resolveSupabaseAuthSession(session.user),
    authSource: 'supabase',
  };
}

function isDemoSource(authSource: AuthSource | null): authSource is 'demo' {
  return authSource === 'demo';
}

function normalizeInvitationToken(token: string | null | undefined): string | null {
  if (typeof token !== 'string') {
    return null;
  }

  const trimmed = token.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  isHydrated: false,
  isAuthenticating: false,
  session: null,
  authSource: null,
  pendingInvitationToken: null,
  processingOAuthCode: null,
  handledOAuthCode: null,
  errorMessage: null,
  clearError: () => set({ errorMessage: null }),
  setPendingInvitationToken: (token) =>
    set({ pendingInvitationToken: normalizeInvitationToken(token) }),
  clearPendingInvitationToken: () => set({ pendingInvitationToken: null }),
  restoreSession: async () => {
    if (!hasSupabaseConfig || !supabaseClient) {
      set({ isHydrated: true, isAuthenticating: false, errorMessage: null });
      return;
    }

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      set({
        session: null,
        authSource: null,
        errorMessage: error.message,
        isHydrated: true,
        isAuthenticating: false,
      });
      return;
    }

    const nextState = await resolveStoreSession(data.session);

    set({
      ...nextState,
      errorMessage: null,
      isHydrated: true,
      isAuthenticating: false,
    });
  },
  syncSessionFromAuthChange: async (session) => {
    if (!hasSupabaseConfig || !supabaseClient) {
      set({ isHydrated: true, isAuthenticating: false });
      return;
    }

    const nextState = await resolveStoreSession(session);

    set({
      ...nextState,
      errorMessage: null,
      isHydrated: true,
      isAuthenticating: false,
    });
  },
  completeOAuthRedirect: async (url) => {
    if (!hasSupabaseConfig || !supabaseClient) {
      set({
        errorMessage: 'Supabase auth is not configured for this build.',
        isAuthenticating: false,
        isHydrated: true,
      });
      return false;
    }

    const invitationToken = normalizeInvitationToken(extractInvitationToken(url));

    if (invitationToken) {
      set({ pendingInvitationToken: invitationToken });
    }

    const code = extractOAuthCode(url);

    if (!code) {
      set({
        errorMessage: 'Missing the authorization code from Google sign-in.',
        isAuthenticating: false,
        isHydrated: true,
      });
      return false;
    }

    const { processingOAuthCode, handledOAuthCode } = get();

    if (handledOAuthCode === code) {
      set({
        errorMessage: null,
        isAuthenticating: false,
        isHydrated: true,
      });
      return true;
    }

    if (processingOAuthCode === code) {
      return false;
    }

    set({
      processingOAuthCode: code,
      isAuthenticating: true,
      errorMessage: null,
      isHydrated: true,
    });

    const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

    if (error) {
      set({
        errorMessage: error.message,
        isAuthenticating: false,
        isHydrated: true,
        processingOAuthCode: null,
      });
      return false;
    }

    await get().restoreSession();

    set({
      handledOAuthCode: code,
      processingOAuthCode: null,
      errorMessage: null,
      isAuthenticating: false,
      isHydrated: true,
    });

    return true;
  },
  signInWithGoogle: async (invitationToken) => {
    if (!hasSupabaseConfig || !supabaseClient) {
      set({
        errorMessage: 'Supabase auth is not configured for this build.',
        isAuthenticating: false,
        isHydrated: true,
      });
      return;
    }

    const normalizedInvitationToken =
      normalizeInvitationToken(invitationToken) ?? get().pendingInvitationToken;

    set({
      isAuthenticating: true,
      errorMessage: null,
      isHydrated: true,
      pendingInvitationToken: normalizedInvitationToken,
    });

    const result = await startGoogleOAuth(normalizedInvitationToken);

    if (result.type === 'success') {
      await get().completeOAuthRedirect(result.url);
      return;
    }

    set({
      isAuthenticating: false,
      errorMessage: result.type === 'error' ? result.message : null,
      isHydrated: true,
    });
  },
  signInWithDemo: (preset) =>
    set({
      session: createDemoSession(preset),
      authSource: 'demo',
      pendingInvitationToken: null,
      processingOAuthCode: null,
      errorMessage: null,
      isHydrated: true,
      isAuthenticating: false,
    }),
  completeProfile: () =>
    set((state) => {
      if (!isDemoSource(state.authSource)) {
        return state;
      }

      return {
        session: completeProfileSession(state.session),
      };
    }),
  approveAccess: () =>
    set((state) => {
      if (!isDemoSource(state.authSource)) {
        return state;
      }

      return {
        session: approveSession(state.session),
      };
    }),
  suspendAccess: () =>
    set((state) => {
      if (!isDemoSource(state.authSource)) {
        return state;
      }

      return {
        session: suspendSession(state.session),
      };
    }),
  reactivateAccess: () =>
    set((state) => {
      if (!isDemoSource(state.authSource)) {
        return state;
      }

      return {
        session: reactivateSession(state.session),
      };
    }),
  signOut: async () => {
    const authSource = get().authSource;

    set({
      isAuthenticating: authSource === 'supabase',
      errorMessage: null,
      isHydrated: true,
    });

    if (authSource === 'supabase' && supabaseClient) {
      const { error } = await supabaseClient.auth.signOut();

      if (error) {
        set({ errorMessage: error.message });
      }
    }

    queryClient.removeQueries({ queryKey: ['auth', 'profile'] });

    set({
      session: null,
      authSource: null,
      pendingInvitationToken: null,
      processingOAuthCode: null,
      handledOAuthCode: null,
      errorMessage: null,
      isHydrated: true,
      isAuthenticating: false,
    });
  },
}));
