import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Records one "Talk to a person" click and the step it happened on (T-22). */
export async function addHandoff(
  client: SupabaseClient,
  handoff: { sessionId: string; userId: string; step: string },
) {
  const { error } = await client.from("handoffs").insert({
    session_id: handoff.sessionId,
    user_id: handoff.userId,
    step: handoff.step,
  });
  if (error) throw new Error(`Could not record handoff: ${error.code}`);
}
