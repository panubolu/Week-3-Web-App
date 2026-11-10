// Questions members ask instead of answering (T-20), and the unanswered
// question log (T-26). Pure rules: no screens, database or Claude.
// Answers come only from the approved content file; anything else gets an
// honest reply, so FirstStep never guesses.

/** Topics the approved content can answer. Anything else is "other". */
export const FAQ_TOPICS = [
  "cost",
  "experience_needed",
  "time_commitment",
  "how_to_apply",
  "acceptance_chances",
  "about_tech_fleet",
] as const;

export type FaqTopic = (typeof FAQ_TOPICS)[number];

/** What each topic covers, written for Claude. */
export const TOPIC_GUIDES: Record<FaqTopic, string> = {
  cost: "Whether Tech Fleet, its programs or classes cost money, or are free.",
  experience_needed: "Whether a degree, resume, portfolio or experience is needed to take part.",
  time_commitment: "How many hours or weeks Tech Fleet programs take.",
  how_to_apply: "How to get started, join, sign up or apply.",
  acceptance_chances: "Whether they will be accepted, get a place, or what their chances are.",
  about_tech_fleet: "What Tech Fleet is or does.",
};

/** The honest reply when the approved content has no answer (T-20). */
export const NO_INFO_REPLY = "I don't have approved information on that, so I don't want to guess.";

/**
 * Removes email addresses and phone numbers before a question is saved (T-26).
 * The database trigger does the same, as a second lock.
 */
export function removeContactDetails(text: string): string {
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email removed]")
    .replace(/\+?[0-9][0-9 ().-]{6,}[0-9]/g, "[phone removed]");
}
