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

/** Longest answer a member can type (Architecture Step 9). */
export const TYPED_MAX = 500;

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

const QUESTION_STEPS: readonly Step[] = ["goal", "experience", "availability"];

function isFirstTimeAnswer(step: Step, field: AnswerField) {
  return step === field;
}

/** Any answer already given can change, until the conversation is finished. */
function canEdit(state: ConversationState, field: AnswerField) {
  return state[field] !== null && state.currentStep !== "feedback";
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

  if (!firstTime && !canEdit(state, field)) {
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

  // Changing an earlier answer mid-way keeps the member on the same question.
  if (!firstTime && QUESTION_STEPS.includes(state.currentStep)) {
    return { ok: true, next: answered, eventType: "edited" };
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
