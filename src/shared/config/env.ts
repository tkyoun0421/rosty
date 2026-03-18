type PublicEnv = {
  appEnv: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  kakaoNativeAppKey: string;
  naverClientId: string;
};

export const publicEnv: PublicEnv = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  kakaoNativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '',
  naverClientId: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID ?? '',
};
