// The conversation rules. This file imports nothing, so every rule can be
// tested on its own, with no screen, database or Claude involved.

export const GOALS = [
  "project_experience",
  "learning",
  "community_involvement",
  "not_sure",
] as const;

export const EXPERIENCE_LEVELS = [
  "new_to_tech",
  "some_experience",
  "experienced_in_tech",
] as const;

export const AVAILABILITY = [
  "under_5",
  "5_to_10",
  "10_to_20",
  "more_than_20",
] as const;

export type Step =
  | "goal"
  | "experience"
  | "availability"
  | "results"
  | "no_match"
  | "feedback";

export type AnswerField = "goal" | "experience" | "availability";

export type ConversationState = {
  currentStep: Step;
  goal: string | null;
  experience: string | null;
  availability: string | null;
  completed: boolean;
};

export type ConversationEvent =
  | { type: "answer"; field: AnswerField; value: string }
  | { type: "finish" };

export type Decision =
  | {
      ok: true;
      next: ConversationState;
      eventType: "answered" | "edited" | "completed";
    }
  | { ok: false; reason: "invalid_value" | "not_allowed" };

const OPTIONS: Record<AnswerField, readonly string[]> = {
  goal: GOALS,
  experience: EXPERIENCE_LEVELS,
  availability: AVAILABILITY,
};

const NEXT_QUESTION: Partial<Record<Step, Step>> = {
  goal: "experience",
  experience: "availability",
};

function isFirstTimeAnswer(step: Step, field: AnswerField) {
  return step === field;
}

function canEdit(step: Step, field: AnswerField) {
  if (step === "results") return true;
  return step === "no_match" && field === "availability";
}

/**
 * Decides what happens next. `hasMatches` reports whether any opportunity
 * fits the given answers.
 */
export function decide(
  state: ConversationState,
  event: ConversationEvent,
  hasMatches: (answers: ConversationState) => boolean,
): Decision {
  if (event.type === "finish") {
    if (state.currentStep !== "results") {
      return { ok: false, reason: "not_allowed" };
    }
    return {
      ok: true,
      next: { ...state, currentStep: "feedback" },
      eventType: "completed",
    };
  }

  const { field, value } = event;
  const firstTime = isFirstTimeAnswer(state.currentStep, field);

  if (!firstTime && !canEdit(state.currentStep, field)) {
    return { ok: false, reason: "not_allowed" };
  }
  if (!OPTIONS[field].includes(value)) {
    return { ok: false, reason: "invalid_value" };
  }

  const answered: ConversationState = { ...state, [field]: value };
  const question = NEXT_QUESTION[state.currentStep];

  if (firstTime && question) {
    return {
      ok: true,
      next: { ...answered, currentStep: question },
      eventType: "answered",
    };
  }

  const matched = hasMatches(answered);
  return {
    ok: true,
    next: {
      ...answered,
      currentStep: matched ? "results" : "no_match",
      completed: answered.completed || matched,
    },
    eventType: firstTime ? "answered" : "edited",
  };
}
