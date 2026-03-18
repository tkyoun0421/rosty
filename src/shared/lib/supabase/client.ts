import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { publicEnv } from '@/shared/config/env';

export const hasSupabaseConfig =
  publicEnv.supabaseUrl.length > 0 && publicEnv.supabaseAnonKey.length > 0;

let client: SupabaseClient | null = null;

if (hasSupabaseConfig) {
  client = createClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey);
}

export const supabaseClient = client;
