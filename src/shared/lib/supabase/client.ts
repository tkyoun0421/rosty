import 'react-native-url-polyfill/auto';

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { publicEnv } from '@/shared/config/env';

const webMemoryStorage = new Map<string, string>();
const authStorageKeyPrefix = 'rosty.supabase.auth';

function getScopedStorageKey(key: string): string {
  return `${authStorageKeyPrefix}.${key}`;
}

function canUseLocalStorage(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  );
}

const authStorage = {
  getItem: async (key: string) => {
    const scopedKey = getScopedStorageKey(key);

    if (Platform.OS === 'web') {
      if (canUseLocalStorage()) {
        return window.localStorage.getItem(scopedKey);
      }

      return webMemoryStorage.get(scopedKey) ?? null;
    }

    return SecureStore.getItemAsync(scopedKey);
  },
  setItem: async (key: string, value: string) => {
    const scopedKey = getScopedStorageKey(key);

    if (Platform.OS === 'web') {
      if (canUseLocalStorage()) {
        window.localStorage.setItem(scopedKey, value);
        return;
      }

      webMemoryStorage.set(scopedKey, value);
      return;
    }

    await SecureStore.setItemAsync(scopedKey, value);
  },
  removeItem: async (key: string) => {
    const scopedKey = getScopedStorageKey(key);

    if (Platform.OS === 'web') {
      if (canUseLocalStorage()) {
        window.localStorage.removeItem(scopedKey);
        return;
      }

      webMemoryStorage.delete(scopedKey);
      return;
    }

    await SecureStore.deleteItemAsync(scopedKey);
  },
};

export const hasSupabaseConfig =
  publicEnv.supabaseUrl.length > 0 && publicEnv.supabaseAnonKey.length > 0;

let client: SupabaseClient | null = null;

if (hasSupabaseConfig) {
  client = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    auth: {
      storage: authStorage,
      autoRefreshToken: Platform.OS !== 'web',
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
}

export const supabaseClient = client;
