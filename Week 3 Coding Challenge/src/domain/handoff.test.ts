import assert from "node:assert/strict";
import { test } from "node:test";
import { handoffSummary } from "./handoff.ts";

test("the summary includes all three answers and where the member is", () => {
  const text = handoffSummary(
    { currentStep: "results", goal: "project_experience", experience: "some_experience", availability: "10_to_20" },
    "Preeti",
  );
  assert.match(text, /^Hi Preeti,/);
  assert.match(text, /What I'm looking for: Project experience/);
  assert.match(text, /My tech experience: Some experience/);
  assert.match(text, /Hours a week: 10 to 20 hours/);
  assert.match(text, /looking at my recommendations/);
});

test("missing answers say not answered yet", () => {
  const text = handoffSummary(
    { currentStep: "experience", goal: "learning", experience: null, availability: null },
    "Preeti",
  );
  assert.match(text, /What I'm looking for: Learning/);
  assert.match(text, /My tech experience: not answered yet/);
  assert.match(text, /Hours a week: not answered yet/);
  assert.match(text, /on the second question/);
});

test("with no saved session, everything is not answered yet", () => {
  const text = handoffSummary(null, "Preeti");
  assert.equal(text.match(/not answered yet/g)?.length, 3);
  assert.match(text, /on the first question/);
});

test("an unknown value is never shown, only the allowed labels", () => {
  const text = handoffSummary(
    { currentStep: "results", goal: "<script>hack</script>", experience: "new_to_tech", availability: "under_5" },
    "Preeti",
  );
  assert.doesNotMatch(text, /script|hack/);
  assert.match(text, /What I'm looking for: not answered yet/);
});
