// Approved content and the rules that match it to a member's answers.
// Pure rules: no screens, database or Claude.

import { z } from "zod";
import { EXPERIENCE_LEVELS, GOALS } from "./conversation.ts";

const opportunitySchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]{1,100}$/),
  title: z.string().min(1).max(80),
  type: z.enum(["project", "class", "workshop", "community"]),
  goals: z.array(z.enum(GOALS)).min(1),
  experienceLevels: z.array(z.enum(EXPERIENCE_LEVELS)).min(1),
  minHours: z.number().int().min(0).max(40),
  maxHours: z.number().int().min(1).max(40),
  noExperienceNeeded: z.boolean(),
  description: z.string().min(1).max(300),
  expected: z.string().min(1).max(300),
  requirements: z.string().max(300),
  url: z.url({ protocol: /^https$/ }),
  lastVerified: z.iso.date().nullable(),
});

export const contentSchema = z
  .strictObject({
    sample: z.boolean(),
    coordinator: z
      .strictObject({ label: z.string().min(1), url: z.url({ protocol: /^https$/ }) })
      .nullable(),
    opportunities: z.array(opportunitySchema).min(1),
  })
  .superRefine((content, ctx) => {
    const ids = new Set<string>();
    content.opportunities.forEach((item, index) => {
      if (ids.has(item.id)) {
        ctx.addIssue({ code: "custom", path: ["opportunities", index, "id"], message: `Duplicate id ${item.id}` });
      }
      ids.add(item.id);
      if (item.minHours > item.maxHours) {
        ctx.addIssue({ code: "custom", path: ["opportunities", index], message: "minHours is above maxHours" });
      }
      if (!content.sample && !item.lastVerified) {
        ctx.addIssue({ code: "custom", path: ["opportunities", index, "lastVerified"], message: "Real content needs a last-verified date" });
      }
    });
  });

export type Content = z.infer<typeof contentSchema>;
export type Opportunity = Content["opportunities"][number];

export type Answers = {
  goal: string | null;
  experience: string | null;
  availability: string | null;
};

const MAX_HOURS: Record<string, number> = {
  under_5: 4,
  "5_to_10": 10,
  "10_to_20": 20,
  more_than_20: 40,
};

const LEVEL_PHRASE: Record<string, string> = {
  new_to_tech: "new to tech",
  some_experience: "with some experience",
  experienced_in_tech: "with tech experience",
};

const HOURS_PHRASE: Record<string, string> = {
  under_5: "under 5 hours",
  "5_to_10": "5 to 10 hours",
  "10_to_20": "10 to 20 hours",
  more_than_20: "more than 20 hours",
};

const GOAL_PHRASE: Record<string, string> = {
  project_experience: "project experience",
  learning: "learning",
  community_involvement: "community involvement",
  not_sure: "any area",
};

function fitsLevelAndHours(item: Opportunity, answers: Answers) {
  const limit = answers.availability ? MAX_HOURS[answers.availability] : undefined;
  return (
    limit !== undefined &&
    item.minHours <= limit &&
    item.experienceLevels.some((level) => level === answers.experience)
  );
}

function fitsGoal(item: Opportunity, goal: string | null) {
  return goal === "not_sure" || item.goals.some((itemGoal) => itemGoal === goal);
}

const byFewestHours = (a: Opportunity, b: Opportunity) =>
  a.minHours - b.minHours || a.title.localeCompare(b.title);

/** Up to three opportunities that fit the goal, experience level and hours. */
export function findMatches(items: Opportunity[], answers: Answers, limit = 3) {
  return items
    .filter((item) => fitsGoal(item, answers.goal) && fitsLevelAndHours(item, answers))
    .sort(byFewestHours)
    .slice(0, limit);
}

/** When nothing matches, one option that fits the level and hours in any area. */
export function findAlternative(items: Opportunity[], answers: Answers) {
  return items.filter((item) => fitsLevelAndHours(item, answers)).sort(byFewestHours)[0] ?? null;
}

/** A plain reason built on the server, used until Claude writes one (T-16). */
export function reasonFor(answers: Answers) {
  const level = answers.experience ? LEVEL_PHRASE[answers.experience] : undefined;
  const hours = answers.availability ? HOURS_PHRASE[answers.availability] : undefined;
  if (!level || !hours) return null;
  return `It's open to people ${level}, and it fits your ${hours} a week.`;
}

/** Why nothing matched, in plain language. */
export function noMatchReason(answers: Answers) {
  const goal = answers.goal ? GOAL_PHRASE[answers.goal] : undefined;
  const hours = answers.availability ? HOURS_PHRASE[answers.availability] : undefined;
  if (!goal || !hours) return "Nothing fits these answers right now.";
  return `Nothing in ${goal} fits ${hours} a week at your experience level right now.`;
}
