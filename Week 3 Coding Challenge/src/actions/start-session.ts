import "server-only";

import { createDataClient } from "@/data/client";
import { findFeedback } from "@/data/feedback";
import { getOrCreateSession, toConversationState } from "@/data/sessions";
import { buildView } from "./view";

/**
 * Steps for: Start a session
 * 1. Find who this person is from their secure cookie
 * 2. If they are new, create a guest account
 * 3. Load or create their session
 * 4. Send back where they are
 */
export async function startSession() {
  const client = await createDataClient();

  const { data: existing } = await client.auth.getUser();
  let user = existing.user;

  if (!user) {
    const { data, error } = await client.auth.signInAnonymously();
    if (error || !data.user) {
      throw new Error(`Could not create guest: ${error?.code ?? "unknown"}`);
    }
    user = data.user;
  }

  const session = await getOrCreateSession(client, user.id);
  const helpful = await findFeedback(client, session.id);
  return {
    view: buildView(toConversationState(session), helpful),
    isGuest: user.is_anonymous === true,
  };
}
