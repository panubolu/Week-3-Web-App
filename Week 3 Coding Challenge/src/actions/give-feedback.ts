import "server-only";

import { createDataClient } from "@/data/client";
import { addFeedback } from "@/data/feedback";
import { findSession } from "@/data/sessions";

/**
 * Steps for: Answer "Was this helpful?"
 * 1. Find who this person is, and load their own session
 * 2. Save the answer once per session
 */
export async function giveFeedback(helpful: boolean) {
  const client = await createDataClient();
  const { data } = await client.auth.getUser();
  if (!data.user) return "no_session" as const;

  const session = await findSession(client, data.user.id);
  if (!session || session.current_step !== "results") return "not_allowed" as const;

  const saved = await addFeedback(client, {
    sessionId: session.id,
    userId: session.user_id,
    helpful,
  });
  return saved ? ("saved" as const) : ("already" as const);
}
