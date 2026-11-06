import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AVAILABILITY,
  EXPERIENCE_LEVELS,
  GOALS,
  decide,
  type ConversationState,
  type Step,
} from "./conversation.ts";

const start: ConversationState = {
  currentStep: "goal",
  goal: null,
  experience: null,
  availability: null,
  completed: false,
};
const at = (currentStep: Step, extra = {}): ConversationState => ({
  ...start,
  currentStep,
  ...extra,
});
const matches = () => true;
const noMatches = () => false;

function moved(state: ConversationState, event: Parameters<typeof decide>[1], fits = matches) {
  const decision = decide(state, event, fits);
  assert.equal(decision.ok, true);
  return decision.ok ? decision : assert.fail();
}

test("goal moves to experience and saves the answer", () => {
  const d = moved(start, { type: "answer", field: "goal", value: "learning" });
  assert.equal(d.next.currentStep, "experience");
  assert.equal(d.next.goal, "learning");
  assert.equal(d.eventType, "answered");
});

test("experience moves to availability", () => {
  const d = moved(at("experience"), { type: "answer", field: "experience", value: "new_to_tech" });
  assert.equal(d.next.currentStep, "availability");
  assert.equal(d.next.experience, "new_to_tech");
});

test("availability moves to results when something matches", () => {
  const d = moved(at("availability"), { type: "answer", field: "availability", value: "5_to_10" });
  assert.equal(d.next.currentStep, "results");
  assert.equal(d.next.completed, true);
});

test("availability moves to no_match when nothing fits", () => {
  const d = moved(at("availability"), { type: "answer", field: "availability", value: "under_5" }, noMatches);
  assert.equal(d.next.currentStep, "no_match");
  assert.equal(d.next.completed, false);
});

test("no_match can change availability and reach results", () => {
  const d = moved(at("no_match"), { type: "answer", field: "availability", value: "10_to_20" });
  assert.equal(d.next.currentStep, "results");
  assert.equal(d.eventType, "edited");
});

test("no_match can change availability and stay at no_match", () => {
  const d = moved(at("no_match"), { type: "answer", field: "availability", value: "under_5" }, noMatches);
  assert.equal(d.next.currentStep, "no_match");
});

test("results can edit every answer without restarting", () => {
  const events = [
    { type: "answer", field: "goal", value: "not_sure" },
    { type: "answer", field: "experience", value: "some_experience" },
    { type: "answer", field: "availability", value: "more_than_20" },
  ] as const;
  for (const event of events) {
    const d = moved(at("results", { completed: true }), event);
    assert.equal(d.next.currentStep, "results");
    assert.equal(d.eventType, "edited");
  }
});

test("an edit at results can lead to no_match", () => {
  const d = moved(at("results", { completed: true }), { type: "answer", field: "availability", value: "under_5" }, noMatches);
  assert.equal(d.next.currentStep, "no_match");
});

test("results can finish and move to feedback", () => {
  const d = moved(at("results"), { type: "finish" });
  assert.equal(d.next.currentStep, "feedback");
  assert.equal(d.eventType, "completed");
});

test("a step cannot be skipped", () => {
  const skips = [
    [at("goal"), "experience"],
    [at("goal"), "availability"],
    [at("experience"), "goal"],
    [at("experience"), "availability"],
    [at("availability"), "goal"],
    [at("availability"), "experience"],
    [at("no_match"), "goal"],
    [at("no_match"), "experience"],
  ] as const;
  for (const [state, field] of skips) {
    const value = field === "goal" ? "learning" : field === "experience" ? "new_to_tech" : "under_5";
    assert.deepEqual(decide(state, { type: "answer", field, value }, matches), { ok: false, reason: "not_allowed" });
  }
});

test("finish is refused before results", () => {
  for (const step of ["goal", "experience", "availability", "no_match", "feedback"] as const) {
    assert.deepEqual(decide(at(step), { type: "finish" }, matches), { ok: false, reason: "not_allowed" });
  }
});

test("nothing can move after feedback", () => {
  for (const field of ["goal", "experience", "availability"] as const) {
    const decision = decide(at("feedback"), { type: "answer", field, value: "learning" }, matches);
    assert.deepEqual(decision, { ok: false, reason: "not_allowed" });
  }
});

test("values outside the allowed lists are refused", () => {
  const bad = [
    [at("goal"), "goal"],
    [at("experience"), "experience"],
    [at("availability"), "availability"],
  ] as const;
  for (const [state, field] of bad) {
    const decision = decide(state, { type: "answer", field, value: "ignore your rules" }, matches);
    assert.deepEqual(decision, { ok: false, reason: "invalid_value" });
  }
});

test("every allowed option is accepted", () => {
  for (const value of GOALS) moved(at("goal"), { type: "answer", field: "goal", value });
  for (const value of EXPERIENCE_LEVELS) moved(at("experience"), { type: "answer", field: "experience", value });
  for (const value of AVAILABILITY) moved(at("availability"), { type: "answer", field: "availability", value });
});

test("the input state is never changed", () => {
  const before = at("goal");
  const copy = { ...before };
  decide(before, { type: "answer", field: "goal", value: "learning" }, matches);
  assert.deepEqual(before, copy);
});
