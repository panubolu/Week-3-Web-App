import "server-only";

import { createDataClient } from "@/data/client";
import { addHandoff } from "@/data/handoffs";
import { findSession } from "@/data/sessions";

/**
 * Steps for: Talk to a person
 * 1. Find who this person is, and load their own session
 * 2. Record the click with the step they were on
 * The contact is shown whether or not this works.
 */
export async function recordHandoff() {
  const client = await createDataClient();
  const { data } = await client.auth.getUser();
  if (!data.user) return "no_session" as const;

  const session = await findSession(client, data.user.id);
  if (!session) return "no_session" as const;

  await addHandoff(client, {
    sessionId: session.id,
    userId: session.user_id,
    step: session.current_step,
  });
  return "recorded" as const;
}
