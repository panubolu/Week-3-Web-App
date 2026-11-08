import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { filterOpportunities, NO_FILTERS } from "./browse.ts";
import { AVAILABILITY } from "./conversation.ts";
import { contentSchema, findMatches } from "./opportunities.ts";

const item = (title: string, goals: string[], experienceLevels: string[], minHours: number) => ({
  title,
  goals,
  experienceLevels,
  minHours,
});

const items = [
  item("Big project", ["project_experience"], ["experienced_in_tech"], 15),
  item("Workshop", ["learning"], ["new_to_tech", "some_experience"], 1),
  item("Class", ["learning"], ["new_to_tech"], 3),
];

const titles = (list: { title: string }[]) => list.map((i) => i.title);

test("no filters lists everything, fewest hours first", () => {
  assert.deepEqual(titles(filterOpportunities(items, NO_FILTERS)), ["Workshop", "Class", "Big project"]);
});

test("each filter narrows the list", () => {
  assert.deepEqual(titles(filterOpportunities(items, { ...NO_FILTERS, area: "learning" })), ["Workshop", "Class"]);
  assert.deepEqual(titles(filterOpportunities(items, { ...NO_FILTERS, level: "some_experience" })), ["Workshop"]);
  assert.deepEqual(titles(filterOpportunities(items, { ...NO_FILTERS, hours: "under_5" })), ["Workshop", "Class"]);
});

test("filters combine, and can match nothing", () => {
  const none = filterOpportunities(items, { area: "project_experience", level: "new_to_tech", hours: "" });
  assert.deepEqual(none, []);
});

test("an unknown value matches nothing instead of failing", () => {
  assert.deepEqual(filterOpportunities(items, { ...NO_FILTERS, hours: "forever" }), []);
});

test("does not change the list it was given", () => {
  const copy = [...items];
  filterOpportunities(items, NO_FILTERS);
  assert.deepEqual(items, copy);
});

test("browse shows everything chat would recommend for the same answers", () => {
  const raw = JSON.parse(readFileSync(new URL("../../content/opportunities.json", import.meta.url), "utf8"));
  const { opportunities } = contentSchema.parse(raw);
  for (const hours of AVAILABILITY) {
    const answers = { goal: "learning", experience: "new_to_tech", availability: hours };
    const browsed = titles(filterOpportunities(opportunities, { area: "learning", level: "new_to_tech", hours }));
    for (const match of titles(findMatches(opportunities, answers))) {
      assert.ok(browsed.includes(match), `${match} missing from browse for ${hours}`);
    }
  }
});
