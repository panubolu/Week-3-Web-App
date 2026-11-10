// The handoff summary (T-23): a short note a member can send to the contact,
// so they don't have to repeat themselves. Pure rules: built only from saved
// structured answers, never from anything the member typed, and with no
// personal details.

import type { Step } from "./conversation.ts";

export type SavedAnswers = {
  currentStep: Step;
  goal: string | null;
  experience: string | null;
  availability: string | null;
};

// Must match the button labels in src/components/conversation/questions.ts.
// A test checks that they stay the same.
export const ANSWER_LABELS: Record<string, Record<string, string>> = {
  goal: {
    project_experience: "Project experience",
    learning: "Learning",
    community_involvement: "Community involvement",
    not_sure: "Not sure yet",
  },
  experience: {
    new_to_tech: "New to tech",
    some_experience: "Some experience",
    experienced_in_tech: "Experienced in tech",
  },
  availability: {
    under_5: "Under 5 hours",
    "5_to_10": "5 to 10 hours",
    "10_to_20": "10 to 20 hours",
    more_than_20: "More than 20 hours",
  },
};

const NOT_ANSWERED = "not answered yet";

const WHERE: Record<Step, string> = {
  goal: "on the first question",
  experience: "on the second question",
  availability: "on the third question",
  results: "looking at my recommendations",
  no_match: "on the screen that said nothing fits yet",
  feedback: "finished with my recommendations",
};

function label(field: keyof typeof ANSWER_LABELS, value: string | null) {
  return (value && ANSWER_LABELS[field][value]) || NOT_ANSWERED;
}

/** The summary text. `contactFirstName` is the approved contact, never the member. */
export function handoffSummary(answers: SavedAnswers | null, contactFirstName: string) {
  const saved = answers ?? { currentStep: "goal" as Step, goal: null, experience: null, availability: null };
  return [
    `Hi ${contactFirstName},`,
    "",
    "I used FirstStep and would like help finding my first step in Tech Fleet.",
    "",
    "My answers so far:",
    `- What I'm looking for: ${label("goal", saved.goal)}`,
    `- My tech experience: ${label("experience", saved.experience)}`,
    `- Hours a week: ${label("availability", saved.availability)}`,
    "",
    `I was ${WHERE[saved.currentStep]}.`,
  ].join("\n");
}
