import "server-only";

import { createDataClient } from "@/data/client";
import { findSession } from "@/data/sessions";
import { addStepEvent } from "@/data/step-events";
import { isKnownOpportunity } from "./view";

/**
 * Steps for: Open a recommendation
 * 1. Check the opportunity is in the approved content
 * 2. Find who this person is, and load their own session
 * 3. Record the click for the KPIs
 */
export async function recordClick(opportunityId: string) {
  if (!isKnownOpportunity(opportunityId)) return "unknown" as const;

  const client = await createDataClient();
  const { data } = await client.auth.getUser();
  if (!data.user) return "no_session" as const;

  const session = await findSession(client, data.user.id);
  if (!session) return "no_session" as const;

  await addStepEvent(client, {
    sessionId: session.id,
    userId: session.user_id,
    step: session.current_step,
    eventType: "recommendation_clicked",
    opportunityId,
  });
  return "recorded" as const;
}
