import "server-only";

import { askClaude } from "@/adapters/claude";
import { createDataClient } from "@/data/client";
import { content } from "@/data/content";
import { findFeedback } from "@/data/feedback";
import { consumeChatQuota } from "@/data/quota";
import { findSession, toConversationState } from "@/data/sessions";
import { addUnansweredQuestion } from "@/data/unanswered";
import type { Step } from "@/domain/conversation";
import { NO_INFO_REPLY } from "@/domain/faq";
import {
  readTypedReply,
  typedAnswerFormat,
  typedAnswerInstructions,
  typedAnswerMessage,
  typedFieldFor,
} from "@/domain/typed-answer";
import { applyAnswer, type AnswerResult } from "./answer-question";
import { buildView, type ConversationView } from "./view";

/** FirstStep's reply to a question. Text and links come only from the approved file. */
export type InfoReply = {
  text: string;
  link: { label: string; url: string } | null;
  /** True for the honest "I don't know" reply, which points to a person. */
  offerPerson: boolean;
};

export type TypedAnswerResult =
  | AnswerResult
  | { status: "question"; view: ConversationView; reply: InfoReply }
  | { status: "unclear" | "limited" | "claude_unavailable" };

/**
 * Steps for: Answer a question in your own words
 * 1. Find who this person is, and load their own session
 * 2. Check this step takes a typed answer
 * 3. Count one Claude call against the usage limits; stop if over
 * 4. Ask Claude what kind of message it is (the words go as data)
 * 5a. An answer: recheck the value, then apply it like a tap
 * 5b. A question: reply from the approved file, or honestly say there's no
 *     approved answer and log the question for coordinators (T-20, T-26)
 * The typed text is never logged anywhere else (ADR-0014).
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
  const claude = await askClaude({
    purpose: `typed-${field}`,
    system: typedAnswerInstructions(field),
    message: typedAnswerMessage(text),
    jsonSchema: format.jsonSchema,
    validate: format.validate,
  });
  if (!claude.ok) return { status: "claude_unavailable" };

  const reply = readTypedReply(field, claude.data);
  if (reply.kind === "unclear") return { status: "unclear" };
  if (reply.kind === "answer") {
    return applyAnswer(client, session, { type: "answer", field, value: reply.value });
  }

  // A question. The step doesn't change, so the conversation continues.
  const approved = reply.topic === "other" ? undefined : content.faq.find((entry) => entry.topic === reply.topic);
  const info: InfoReply = approved
    ? { text: approved.answer, link: approved.link, offerPerson: approved.topic === "acceptance_chances" }
    : { text: NO_INFO_REPLY, link: null, offerPerson: true };

  if (!approved) {
    // A failed log never blocks the member (T-26).
    await addUnansweredQuestion(client, { sessionId: session.id, userId: session.user_id, text }).catch(
      (error) => console.error("Unanswered question not logged:", error),
    );
  }

  const helpful = await findFeedback(client, session.id).catch(() => null);
  return { status: "question", view: buildView(toConversationState(session), helpful), reply: info };
}
