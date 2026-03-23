import Constants from 'expo-constants';

import { publicEnv } from '@/shared/config/env';
import { hasSupabaseConfig } from '@/shared/lib/supabase/client';

export type SettingsAppInfo = {
  appName: string;
  version: string;
  appEnv: string;
  authStatus: string;
  deliveryStatus: string;
  iosBundleId: string;
  androidPackage: string;
};

export function createSettingsAppInfo(input: {
  appName?: string | null;
  version?: string | null;
  appEnv: string;
  hasSupabaseConfig: boolean;
  iosBundleId?: string | null;
  androidPackage?: string | null;
}): SettingsAppInfo {
  return {
    appName: input.appName?.trim() || 'Rosty',
    version: input.version?.trim() || '0.1.0',
    appEnv: input.appEnv.trim() || 'development',
    authStatus: input.hasSupabaseConfig
      ? 'Supabase auth configured'
      : 'Local auth fallback only',
    deliveryStatus: 'Push delivery is not wired in this build yet.',
    iosBundleId: input.iosBundleId?.trim() || 'Unavailable',
    androidPackage: input.androidPackage?.trim() || 'Unavailable',
  };
}

export function getSettingsAppInfo(): SettingsAppInfo {
  return createSettingsAppInfo({
    appName: Constants.expoConfig?.name,
    version: Constants.expoConfig?.version,
    appEnv: publicEnv.appEnv,
    hasSupabaseConfig,
    iosBundleId: Constants.expoConfig?.ios?.bundleIdentifier,
    androidPackage: Constants.expoConfig?.android?.package,
  });
}
