import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type SessionRow = {
  id: string;
  current_step: string;
};

const UNIQUE_VIOLATION = "23505";

async function findSession(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("sessions")
    .select("id, current_step")
    .eq("user_id", userId)
    .maybeSingle<SessionRow>();
  if (error) throw new Error(`Could not read session: ${error.code}`);
  return data;
}

/** Returns this person's session, creating it on their first visit. */
export async function getOrCreateSession(
  client: SupabaseClient,
  userId: string,
): Promise<SessionRow> {
  const existing = await findSession(client, userId);
  if (existing) return existing;

  const { data, error } = await client
    .from("sessions")
    .insert({ user_id: userId })
    .select("id, current_step")
    .single<SessionRow>();

  if (data) return data;

  // Two tabs can start at once. If the other tab won, use its row.
  if (error?.code === UNIQUE_VIOLATION) {
    const winner = await findSession(client, userId);
    if (winner) return winner;
  }
  throw new Error(`Could not create session: ${error?.code ?? "unknown"}`);
}
