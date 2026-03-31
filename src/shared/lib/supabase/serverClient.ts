import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required Supabase env: ${name}`);
  }

  return value;
}

export async function getServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(entries) {
          for (const entry of entries) {
            try {
              cookieStore.set(entry.name, entry.value, entry.options);
            } catch {
              // Server Components can read cookies but cannot always write them.
              // Route Handlers and Server Actions still persist refreshed auth cookies.
            }
          }
        },
      },
    },
  );
}
