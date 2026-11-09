import "server-only";

import { askClaude } from "@/adapters/claude";
import { createDataClient } from "@/data/client";
import { consumeChatQuota } from "@/data/quota";
import { findSession } from "@/data/sessions";
import type { Step } from "@/domain/conversation";
import {
  acceptedValue,
  typedAnswerFormat,
  typedAnswerInstructions,
  typedAnswerMessage,
  typedFieldFor,
} from "@/domain/typed-answer";
import { applyAnswer, type AnswerResult } from "./answer-question";

export type TypedAnswerResult =
  | AnswerResult
  | { status: "unclear" | "limited" | "claude_unavailable" };

/**
 * Steps for: Answer a question in your own words
 * 1. Find who this person is, and load their own session
 * 2. Check this step takes a typed answer
 * 3. Count one Claude call against the usage limits; stop if over
 * 4. Ask Claude which allowed option the words mean (the words go as data)
 * 5. Recheck the value against the allowed list, then apply it like a tap
 * The typed text is never stored or logged (ADR-0014).
 */
export async function answerTyped(text: string): Promise<TypedAnswerResult> {
  const client = await createDataClient();
  const { data } = await client.auth.getUser();
  if (!data.user) return { status: "no_session" };

  const session = await findSession(client, data.user.id);
  if (!session) return { status: "no_session" };

  const field = typedFieldFor(session.current_step as Step);
  if (!field) return { status: "not_allowed" };

  // If the limit check itself fails, Claude is not called (T-17).
  const allowed = await consumeChatQuota(client).catch((error) => {
    console.error("Usage limit check failed:", error);
    return null;
  });
  if (allowed === null) return { status: "claude_unavailable" };
  if (!allowed) return { status: "limited" };

  const format = typedAnswerFormat(field);
  const reply = await askClaude({
    purpose: `typed-${field}`,
    system: typedAnswerInstructions(field),
    message: typedAnswerMessage(text),
    jsonSchema: format.jsonSchema,
    validate: format.validate,
  });
  if (!reply.ok) return { status: "claude_unavailable" };

  const value = acceptedValue(field, reply.data.value);
  if (!value) return { status: "unclear" };

  return applyAnswer(client, session, { type: "answer", field, value });
}
