import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { AVAILABILITY, EXPERIENCE_LEVELS, GOALS } from "./conversation.ts";
import {
  contentSchema,
  findAlternative,
  findMatches,
  noMatchReason,
  reasonFor,
  type Opportunity,
} from "./opportunities.ts";

const file = new URL("../../content/opportunities.json", import.meta.url);
const raw = JSON.parse(readFileSync(file, "utf8"));

const item = (overrides: Partial<Opportunity>): Opportunity => ({
  id: "test",
  title: "Test",
  type: "project",
  goals: ["learning"],
  experienceLevels: ["new_to_tech"],
  minHours: 1,
  maxHours: 3,
  noExperienceNeeded: true,
  description: "A test",
  expected: "Do a test",
  requirements: "None",
  url: "https://example.org",
  lastVerified: null,
  ...overrides,
});

test("the content file passes the checks", () => {
  const result = contentSchema.safeParse(raw);
  assert.equal(result.success, true, JSON.stringify(result.error?.issues));
});

test("sample content is labeled as sample", () => {
  const content = contentSchema.parse(raw);
  if (content.sample) {
    for (const opportunity of content.opportunities) {
      assert.match(opportunity.id, /^sample-/);
      assert.match(opportunity.description, /^Sample:/);
    }
  }
});

test("a link that is not https is refused", () => {
  const bad = { ...raw, opportunities: [{ ...raw.opportunities[0], url: "http://example.org" }] };
  assert.equal(contentSchema.safeParse(bad).success, false);
});

test("a missing field is refused", () => {
  const rest = { ...raw.opportunities[0] };
  delete rest.title;
  const bad = { ...raw, opportunities: [rest] };
  assert.equal(contentSchema.safeParse(bad).success, false);
});

test("duplicate ids are refused", () => {
  const bad = { ...raw, opportunities: [raw.opportunities[0], raw.opportunities[0]] };
  assert.equal(contentSchema.safeParse(bad).success, false);
});

test("real content needs a last-verified date", () => {
  const bad = { ...raw, sample: false };
  assert.equal(contentSchema.safeParse(bad).success, false);
});

test("matches respect level and hours", () => {
  const items = [
    item({ id: "fits", minHours: 2 }),
    item({ id: "too-long", minHours: 15 }),
    item({ id: "wrong-level", experienceLevels: ["experienced_in_tech"] }),
  ];
  const found = findMatches(items, { goal: "learning", experience: "new_to_tech", availability: "under_5" });
  assert.deepEqual(found.map((o) => o.id), ["fits"]);
});

test("matches respect the goal, unless the member is not sure", () => {
  const items = [item({ id: "learn" }), item({ id: "project", goals: ["project_experience"] })];
  const answers = { experience: "new_to_tech", availability: "5_to_10" };
  assert.deepEqual(findMatches(items, { ...answers, goal: "learning" }).map((o) => o.id), ["learn"]);
  assert.equal(findMatches(items, { ...answers, goal: "not_sure" }).length, 2);
});

test("at most three matches, fewest hours first", () => {
  const items = [5, 1, 3, 2].map((h) => item({ id: `h${h}`, minHours: h, maxHours: h + 1 }));
  const found = findMatches(items, { goal: "learning", experience: "new_to_tech", availability: "5_to_10" });
  assert.deepEqual(found.map((o) => o.id), ["h1", "h2", "h3"]);
});

test("one fitting opportunity is shown alone", () => {
  const items = [item({ id: "only" })];
  assert.equal(findMatches(items, { goal: "learning", experience: "new_to_tech", availability: "under_5" }).length, 1);
});

test("the alternative ignores the goal but keeps level and hours", () => {
  const items = [item({ id: "community", goals: ["community_involvement"], minHours: 1 })];
  const answers = { goal: "learning", experience: "new_to_tech", availability: "under_5" };
  assert.equal(findMatches([], answers).length, 0);
  assert.equal(findAlternative(items, answers)?.id, "community");
  assert.equal(findAlternative([item({ minHours: 20, maxHours: 25 })], answers), null);
});

test("every answer combination gets a match or a clear reason", () => {
  const content = contentSchema.parse(raw);
  for (const goal of GOALS) for (const experience of EXPERIENCE_LEVELS) for (const availability of AVAILABILITY) {
    const answers = { goal, experience, availability };
    const found = findMatches(content.opportunities, answers);
    assert.ok(found.length > 0 || noMatchReason(answers).startsWith("Nothing in"));
  }
});

test("the sample data can reach the no-match screen, as in Figma screen 5", () => {
  const content = contentSchema.parse(raw);
  const answers = { goal: "project_experience", experience: "new_to_tech", availability: "under_5" };
  assert.equal(findMatches(content.opportunities, answers).length, 0);
  assert.notEqual(findAlternative(content.opportunities, answers), null);
});

test("the reason uses the member's answers", () => {
  assert.equal(
    reasonFor({ goal: "learning", experience: "new_to_tech", availability: "5_to_10" }),
    "It's open to people new to tech, and it fits your 5 to 10 hours a week.",
  );
});
