import "server-only";

import { askClaude } from "@/adapters/claude";
import { createDataClient } from "@/data/client";
import { content } from "@/data/content";
import { findFeedback } from "@/data/feedback";
import { consumeChatQuota } from "@/data/quota";
import { findSession, saveSession, toConversationState, withMissCount } from "@/data/sessions";
import { addUnansweredQuestion } from "@/data/unanswered";
import type { Step } from "@/domain/conversation";
import { NO_INFO_REPLY } from "@/domain/faq";
import { afterMiss, missReply } from "@/domain/misses";
import {
  CHANGE_FOLLOW_UP,
  changeConfirmation,
  readTypedReply,
  typedAnswerFormat,
  typedAnswerInstructions,
  typedAnswerMessage,
  typedFieldFor,
} from "@/domain/typed-answer";
import { applyAnswer, type AnswerResult } from "./answer-question";
import { buildView, type ConversationView } from "./view";

/** FirstStep's reply that doesn't change the step. Its wording is fixed or from the approved file. */
export type InfoReply = {
  text: string;
  link: { label: string; url: string } | null;
  /** Points to Talk to a person. */
  offerPerson: boolean;
  /** Points to the browse view (after two misses, T-19). */
  offerBrowse: boolean;
};

export type TypedAnswerResult =
  | AnswerResult
  | { status: "reply"; view: ConversationView; reply: InfoReply }
  | { status: "limited" | "claude_unavailable" };

/**
 * Steps for: Answer a question in your own words
 * 1. Find who this person is, and load their own session
 * 2. Check this step takes typing (every step except after feedback)
 * 3. Count one Claude call against the usage limits; stop if over
 * 4. Ask Claude what kind of message it is. Claude gets the saved answers
 *    and the new message as data, never a transcript (ADR-0014).
 * 5a. An answer: recheck the value, then apply it like a tap
 * 5b. A change to an earlier answer: recheck it, then apply it exactly like
 *     the Edit button, and say what changed (T-42)
 * 5c. A question: reply from the approved file, or honestly say there's no
 *     approved answer and log the question for coordinators (T-20, T-26)
 * The typed text is never logged anywhere else.
 */
export async function answerTyped(text: string): Promise<TypedAnswerResult> {
  const client = await createDataClient();
  const { data } = await client.auth.getUser();
  if (!data.user) return { status: "no_session" };

  const session = await findSession(client, data.user.id);
  if (!session) return { status: "no_session" };

  const step = session.current_step as Step;
  if (step === "feedback") return { status: "not_allowed" };
  // The question on screen, or null on the results screen.
  const field = typedFieldFor(step);
  const savedAnswers = {
    goal: session.goal,
    experience: session.experience_level,
    availability: session.availability,
  };

  // If the limit check itself fails, Claude is not called (T-17).
  const allowed = await consumeChatQuota(client).catch((error) => {
    console.error("Usage limit check failed:", error);
    return null;
  });
  if (allowed === null) return { status: "claude_unavailable" };
  if (!allowed) return { status: "limited" };

  const format = typedAnswerFormat(field);
  const claude = await askClaude({
    purpose: `typed-${field ?? step}`,
    system: typedAnswerInstructions(field, savedAnswers),
    message: typedAnswerMessage(text),
    jsonSchema: format.jsonSchema,
    validate: format.validate,
  });
  if (!claude.ok) return { status: "claude_unavailable" };

  const reply = readTypedReply(field, claude.data, savedAnswers);
  if (reply.kind === "answer") {
    if (field) return applyAnswer(client, session, { type: "answer", field, value: reply.value });
    // readTypedReply never returns an answer without a question on screen.
    return { status: "not_allowed" };
  }
  if (reply.kind === "change") {
    // The same path as the Edit button (T-18), so both give the same result.
    const changed = await applyAnswer(client, session, { type: "answer", field: reply.field, value: reply.value });
    if (changed.status !== "ok") return changed;
    return {
      status: "reply",
      view: changed.view,
      reply: { text: changeConfirmation(reply.field, reply.value), link: null, offerPerson: false, offerBrowse: false },
    };
  }

  const helpful = await findFeedback(client, session.id).catch(() => null);
  const view = buildView(toConversationState(session), helpful);

  if (reply.kind === "change_unclear") {
    // A short follow-up; nothing is changed.
    return {
      status: "reply",
      view,
      reply: { text: CHANGE_FOLLOW_UP, link: null, offerPerson: false, offerBrowse: false },
    };
  }

  if (reply.kind === "unclear") {
    // Not understood: rephrase once, then offer browse or a person (T-19).
    const miss = afterMiss(session.miss_count);
    const saved = await saveSession(client, session, withMissCount(session, miss.missCount));
    if (!saved) return { status: "conflict" };
    const help = miss.response === "offer_help";
    return {
      status: "reply",
      view,
      reply: { text: missReply(field, miss.response), link: null, offerPerson: help, offerBrowse: help },
    };
  }

  // A question. The step doesn't change, so the conversation continues.
  const approved = reply.topic === "other" ? undefined : content.faq.find((entry) => entry.topic === reply.topic);
  const info: InfoReply = approved
    ? { text: approved.answer, link: approved.link, offerPerson: approved.topic === "acceptance_chances", offerBrowse: false }
    : { text: NO_INFO_REPLY, link: null, offerPerson: true, offerBrowse: false };

  if (!approved) {
    // A failed log never blocks the member (T-26).
    await addUnansweredQuestion(client, { sessionId: session.id, userId: session.user_id, text }).catch(
      (error) => console.error("Unanswered question not logged:", error),
    );
  }

  return { status: "reply", view, reply: info };
}
