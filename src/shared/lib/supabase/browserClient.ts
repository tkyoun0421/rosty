"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;
const browserEnvKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required Supabase env: ${name}`);
  }

  return value;
}

export function getBrowserSupabaseClient() {
  if (!hasBrowserSupabaseEnv()) {
    throw new Error("Missing required Supabase browser env.");
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    );
  }

  return browserClient;
}

export function hasBrowserSupabaseEnv() {
  return browserEnvKeys.every((name) => Boolean(process.env[name]));
}
