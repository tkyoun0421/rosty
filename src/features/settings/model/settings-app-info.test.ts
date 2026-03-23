import { createSettingsAppInfo } from '@/features/settings/model/settings-app-info';

describe('createSettingsAppInfo', () => {
  it('normalizes the settings app-info fields', () => {
    expect(
      createSettingsAppInfo({
        appName: 'Rosty',
        version: '0.1.0',
        appEnv: 'production',
        hasSupabaseConfig: true,
        iosBundleId: 'com.rosty.mobile',
        androidPackage: 'com.rosty.mobile',
      }),
    ).toEqual({
      appName: 'Rosty',
      version: '0.1.0',
      appEnv: 'production',
      authStatus: 'Supabase auth configured',
      deliveryStatus: 'Push delivery is not wired in this build yet.',
      iosBundleId: 'com.rosty.mobile',
      androidPackage: 'com.rosty.mobile',
    });
  });

  it('falls back to safe defaults when app-info fields are missing', () => {
    expect(
      createSettingsAppInfo({
        appEnv: '',
        hasSupabaseConfig: false,
      }),
    ).toEqual({
      appName: 'Rosty',
      version: '0.1.0',
      appEnv: 'development',
      authStatus: 'Local auth fallback only',
      deliveryStatus: 'Push delivery is not wired in this build yet.',
      iosBundleId: 'Unavailable',
      androidPackage: 'Unavailable',
    });
  });
});
