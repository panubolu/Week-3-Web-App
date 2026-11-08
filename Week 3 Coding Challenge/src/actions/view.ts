import "server-only";

import { content } from "@/data/content";
import type { ConversationState } from "@/domain/conversation";
import {
  findAlternative,
  findMatches,
  noMatchReason,
  reasonFor,
  type Opportunity,
} from "@/domain/opportunities";

export type Card = Pick<
  Opportunity,
  | "id"
  | "title"
  | "minHours"
  | "maxHours"
  | "noExperienceNeeded"
  | "expected"
  | "url"
  | "lastVerified"
> & { reason: string | null };

export type ConversationView = {
  state: ConversationState;
  helpful: boolean | null;
  sample: boolean;
  recommendations: Card[];
  noMatch: { reason: string; alternative: Card | null } | null;
};

export const hasMatches = (answers: ConversationState) =>
  findMatches(content.opportunities, answers).length > 0;

export const isKnownOpportunity = (id: string) =>
  content.opportunities.some((item) => item.id === id);

function toCard(item: Opportunity, state: ConversationState): Card {
  return {
    id: item.id,
    title: item.title,
    minHours: item.minHours,
    maxHours: item.maxHours,
    noExperienceNeeded: item.noExperienceNeeded,
    expected: item.expected,
    url: item.url,
    lastVerified: item.lastVerified,
    reason: reasonFor(state),
  };
}

/** What the screen needs for this state. Links come only from the content file. */
export function buildView(
  state: ConversationState,
  helpful: boolean | null,
): ConversationView {
  const view: ConversationView = {
    state,
    helpful,
    sample: content.sample,
    recommendations: [],
    noMatch: null,
  };

  if (state.currentStep === "results") {
    view.recommendations = findMatches(content.opportunities, state).map((item) =>
      toCard(item, state),
    );
  }
  if (state.currentStep === "no_match") {
    const alternative = findAlternative(content.opportunities, state);
    view.noMatch = {
      reason: noMatchReason(state),
      alternative: alternative ? toCard(alternative, state) : null,
    };
  }
  return view;
}
