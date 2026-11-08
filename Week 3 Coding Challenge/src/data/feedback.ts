import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const UNIQUE_VIOLATION = "23505";

/** The answer this session gave, or null if it hasn't answered yet. */
export async function findFeedback(client: SupabaseClient, sessionId: string) {
  const { data, error } = await client
    .from("feedback")
    .select("helpful")
    .eq("session_id", sessionId)
    .maybeSingle<{ helpful: boolean }>();
  if (error) throw new Error(`Could not read feedback: ${error.code}`);
  return data?.helpful ?? null;
}

/** Saves the answer. Returns false if this session already answered. */
export async function addFeedback(
  client: SupabaseClient,
  feedback: { sessionId: string; userId: string; helpful: boolean },
) {
  const { error } = await client.from("feedback").insert({
    session_id: feedback.sessionId,
    user_id: feedback.userId,
    helpful: feedback.helpful,
  });
  if (!error) return true;
  if (error.code === UNIQUE_VIOLATION) return false;
  throw new Error(`Could not save feedback: ${error.code}`);
}
