import "server-only";

import { createDataClient } from "@/data/client";
import { content } from "@/data/content";
import { addHandoff } from "@/data/handoffs";
import { findSession, toConversationState } from "@/data/sessions";
import { handoffSummary } from "@/domain/handoff";

export type HandoffResult = {
  result: "recorded" | "not_recorded" | "no_session";
  summary: string;
};

const contactFirstName = () => content.coordinator?.name.split(" ")[0] ?? "there";

/**
 * Steps for: Talk to a person
 * 1. Find who this person is, and load their own session
 * 2. Record the visit with the step they were on (T-22)
 * 3. Build their summary from saved answers only (T-23)
 * The summary comes back even if recording fails.
 */
export async function recordHandoff(): Promise<HandoffResult> {
  const client = await createDataClient();
  const { data } = await client.auth.getUser();
  if (!data.user) return { result: "no_session", summary: handoffSummary(null, contactFirstName()) };

  const session = await findSession(client, data.user.id);
  if (!session) return { result: "no_session", summary: handoffSummary(null, contactFirstName()) };

  const summary = handoffSummary(toConversationState(session), contactFirstName());
  try {
    await addHandoff(client, {
      sessionId: session.id,
      userId: session.user_id,
      step: session.current_step,
    });
    return { result: "recorded", summary };
  } catch (error) {
    console.error("Handoff not recorded:", error);
    return { result: "not_recorded", summary };
  }
}
