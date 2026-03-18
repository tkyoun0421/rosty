type PublicEnv = {
  appEnv: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  googleWebClientId: string;
  kakaoNativeAppKey: string;
  naverClientId: string;
};

export const publicEnv: PublicEnv = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  kakaoNativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '',
  naverClientId: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID ?? '',
};
