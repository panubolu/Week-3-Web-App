import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { removeContactDetails } from "@/domain/faq";

/**
 * Saves a question FirstStep couldn't answer, for coordinators to review (T-26).
 * Emails and phone numbers are removed here and again by a database trigger.
 * Rows can't be changed or read by other people through the app.
 */
export async function addUnansweredQuestion(
  client: SupabaseClient,
  question: { sessionId: string; userId: string; text: string },
) {
  const { error } = await client.from("unanswered_questions").insert({
    session_id: question.sessionId,
    user_id: question.userId,
    question_text: removeContactDetails(question.text).slice(0, 500),
  });
  if (error) throw new Error(`Could not log question: ${error.code}`);
}
