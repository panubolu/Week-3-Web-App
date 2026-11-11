import "server-only";

import { createDataClient } from "@/data/client";
import type { GoogleMode } from "@/domain/sign-in";

export type { GoogleMode };

/**
 * Steps for: Save my progress, or sign in to saved progress
 * 1. Find who this person is from their secure cookie
 * 2. Save: link Google to this guest, so their ID and answers stay the same
 *    Sign in: open the saved account
 * 3. Send back Google's address
 */
export async function startGoogle(origin: string, mode: GoogleMode) {
  const client = await createDataClient();
  const { data: current } = await client.auth.getUser();
  const credentials = {
    provider: "google" as const,
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  };

  const { data, error } =
    mode === "save" && current.user?.is_anonymous
      ? await client.auth.linkIdentity(credentials)
      : await client.auth.signInWithOAuth(credentials);

  if (error || !data.url) {
    throw new Error(`Could not start Google: ${error?.code ?? "no address"}`);
  }
  return data.url;
}

/** Finishes the Google step using the one-time code in the return address. */
export async function finishGoogle(code: string) {
  const client = await createDataClient();
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw new Error(`Could not finish Google: ${error.code}`);
}

export async function signOut() {
  const client = await createDataClient();
  await client.auth.signOut();
}
