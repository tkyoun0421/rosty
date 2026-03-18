import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  approveSession,
  completeProfileSession,
  createDemoSession,
  reactivateSession,
  suspendSession,
} from '@/features/auth/model/auth-rules';
import type { AuthSession, DemoAuthPreset } from '@/features/auth/model/auth-types';

type AuthStore = {
  isHydrated: boolean;
  session: AuthSession | null;
  markHydrated: () => void;
  signInWithDemo: (preset: DemoAuthPreset) => void;
  completeProfile: () => void;
  approveAccess: () => void;
  suspendAccess: () => void;
  reactivateAccess: () => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isHydrated: false,
      session: null,
      markHydrated: () => set({ isHydrated: true }),
      signInWithDemo: (preset) => set({ session: createDemoSession(preset) }),
      completeProfile: () => set((state) => ({ session: completeProfileSession(state.session) })),
      approveAccess: () => set((state) => ({ session: approveSession(state.session) })),
      suspendAccess: () => set((state) => ({ session: suspendSession(state.session) })),
      reactivateAccess: () => set((state) => ({ session: reactivateSession(state.session) })),
      signOut: () => set({ session: null }),
    }),
    {
      name: 'rosty.auth.session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

