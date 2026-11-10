import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createDataClient } from "@/data/client";
import { findFeedback } from "@/data/feedback";
import { addStepEvent } from "@/data/step-events";
import {
  findSession,
  saveSession,
  toConversationState,
  type SessionRow,
} from "@/data/sessions";
import { decide, type ConversationEvent } from "@/domain/conversation";
import { MISS_COUNT_AFTER_ANSWER } from "@/domain/misses";
import { buildView, hasMatches, type ConversationView } from "./view";

export type AnswerResult =
  | { status: "ok"; view: ConversationView }
  | { status: "no_session" | "conflict" | "not_allowed" | "invalid_value" };

/**
 * Steps shared by tapped and typed answers, once the person and their
 * session are known:
 * 1. Ask the rules what happens next
 * 2. Save, unless another tab saved first
 * 3. Record the step and send back the new state
 */
export async function applyAnswer(
  client: SupabaseClient,
  session: SessionRow,
  event: ConversationEvent,
): Promise<AnswerResult> {
  const decision = decide(toConversationState(session), event, hasMatches);
  if (!decision.ok) return { status: decision.reason };

  const { next, eventType } = decision;
  const saved = await saveSession(client, session, {
    current_step: next.currentStep,
    goal: next.goal,
    experience_level: next.experience,
    availability: next.availability,
    completed: next.completed,
    // An answer that lands resets the misunderstanding count (T-19).
    miss_count: MISS_COUNT_AFTER_ANSWER,
  });
  if (!saved) return { status: "conflict" };

  // The answer is saved. Extras below must not turn that into an error.
  await addStepEvent(client, {
    sessionId: session.id,
    userId: session.user_id,
    step: session.current_step,
    eventType,
  }).catch((error) => console.error("Step event not recorded:", error));

  const helpful = await findFeedback(client, session.id).catch((error) => {
    console.error("Feedback not loaded:", error);
    return null;
  });
  return { status: "ok", view: buildView(next, helpful) };
}

/**
 * Steps for: Answer a question (tapped)
 * 1. Find who this person is, and load their own session
 * 2. Apply the answer
 */
export async function answerQuestion(event: ConversationEvent): Promise<AnswerResult> {
  const client = await createDataClient();
  const { data } = await client.auth.getUser();
  if (!data.user) return { status: "no_session" };

  const session = await findSession(client, data.user.id);
  if (!session) return { status: "no_session" };

  return applyAnswer(client, session, event);
}
