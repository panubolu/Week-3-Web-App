import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchWithTimeout } from "./retry";

function requireSetting(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing setting ${name}. Add it to .env.local and to Vercel.`);
  }
  return value;
}

/**
 * Connects to Supabase as the person making this request, so Row Level
 * Security applies to every query. Only code in src/data should call this.
 */
export async function createDataClient() {
  const url = requireSetting(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const publishableKey = requireSetting(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    // A stuck database must not leave the member waiting forever.
    global: { fetch: fetchWithTimeout },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            });
          }
        } catch {
          // Pages cannot set cookies. Server actions and API routes can.
        }
      },
    },
  });
}
