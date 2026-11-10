// What happens when FirstStep doesn't understand a typed answer (T-19).
// Pure rules: rephrase once, then offer browse or a person, so nobody gets
// stuck in a loop. A successful answer resets the count.

import type { AnswerField } from "./conversation.ts";

/** Misses before FirstStep stops rephrasing and offers other ways forward. */
export const MISSES_BEFORE_HELP = 2;

export type MissResponse = "rephrase" | "offer_help";

/** The new miss count, and what FirstStep should do about it. */
export function afterMiss(missCount: number): { missCount: number; response: MissResponse } {
  const next = Math.max(0, missCount) + 1;
  return { missCount: next, response: next >= MISSES_BEFORE_HELP ? "offer_help" : "rephrase" };
}

/** The count after a successful answer. */
export const MISS_COUNT_AFTER_ANSWER = 0;

// The same question in simpler words, with examples.
const REPHRASED: Record<AnswerField, string> = {
  goal:
    "Let me ask another way. Are you mostly hoping to work on a real project, learn new skills, meet people, or are you not sure yet? You can also tap one of the options.",
  experience:
    "Let me ask another way. Have you worked in a tech job before, done a course, bootcamp or side project, or is tech new to you? You can also tap one of the options.",
  availability:
    "Let me ask another way. Roughly how many hours could you give each week, for example \"about 3 hours\"? You can also tap one of the options.",
};

export const HELP_AFTER_MISSES =
  "I'm having trouble understanding, and I don't want to keep you stuck. You can tap one of the options, or try one of these instead:";

/** FirstStep's fixed wording for a miss. */
export function missReply(field: AnswerField, response: MissResponse): string {
  return response === "rephrase" ? REPHRASED[field] : HELP_AFTER_MISSES;
}
