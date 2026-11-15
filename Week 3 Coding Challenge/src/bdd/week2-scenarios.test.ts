// BDD checks for the Week 2 MVP requirements (Week 5, ADR-0018).
//
// Each test is one use case scenario from "Epics and Features for FirstStep"
// written as Given / When / Then, and runs the real rules against the real
// approved content. If a change breaks a behavior the team agreed on in
// Week 2, CI turns red. Claude itself is not called here: its behavior is
// covered by the rule tests (npm run rule-tests), which run by hand.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import { QUESTIONS } from "../components/conversation/questions.ts";
import { filterOpportunities, HOUR_LIMITS } from "../domain/browse.ts";
import {
  AVAILABILITY,
  decide,
  EXPERIENCE_LEVELS,
  GOALS,
  type ConversationState,
} from "../domain/conversation.ts";
import { NO_INFO_REPLY } from "../domain/faq.ts";
import { handoffSummary } from "../domain/handoff.ts";
import { afterMiss, HELP_AFTER_MISSES, missReply } from "../domain/misses.ts";
import { contentSchema, findMatches, reasonFor, type Answers } from "../domain/opportunities.ts";

const content = contentSchema.parse(
  JSON.parse(readFileSync(new URL("../../content/opportunities.json", import.meta.url), "utf8")),
);
const approved = content.opportunities;
const approvedIds = new Set(approved.map((item) => item.id));

const careerChanger: Answers = { goal: "learning", experience: "new_to_tech", availability: "under_5" };
const hasMatches = (state: ConversationState) => findMatches(approved, state).length > 0;
const atResults: ConversationState = { currentStep: "results", ...careerChanger, completed: true };

describe("Epic 1: Guided Conversation", () => {
  test("Goal question: Given a member opens FirstStep, When the first question shows, Then there are four goal options", () => {
    assert.equal(GOALS.length, 4);
    const goal = QUESTIONS.find((q) => q.field === "goal");
    assert.ok(goal, "the goal question is missing");
    assert.equal(goal.options.length, 4);
  });

  test("Experience question: Given a member isn't sure what counts as beginner, When they see the levels, Then each level is explained in one line", () => {
    const experience = QUESTIONS.find((q) => q.field === "experience");
    assert.ok(experience, "the experience question is missing");
    assert.equal(experience.options.length, EXPERIENCE_LEVELS.length);
    for (const option of experience.options) {
      assert.ok(option.hint && option.hint.length > 0, `"${option.label}" has no one-line explanation`);
      assert.ok(!option.hint.includes("\n"), `"${option.label}" explanation is more than one line`);
    }
  });

  test("Availability question: Given a member selects Under 5 hours, When results load, Then every result fits their published time commitment", () => {
    const results = findMatches(approved, careerChanger);
    assert.ok(results.length > 0, "no results for a career changer with under 5 hours");
    for (const item of results) {
      assert.ok(item.minHours <= HOUR_LIMITS.under_5, `${item.id} needs ${item.minHours} hours`);
    }
  });

  test("Progress: Given the three questions, When a member answers them in order, Then the steps go Goal, Experience, Time, then results", () => {
    let state: ConversationState = { currentStep: "goal", goal: null, experience: null, availability: null, completed: false };
    const steps = [state.currentStep];
    for (const [field, value] of [["goal", "learning"], ["experience", "new_to_tech"], ["availability", "under_5"]] as const) {
      const decision = decide(state, { type: "answer", field, value }, hasMatches);
      assert.equal(decision.ok, true);
      if (!decision.ok) return;
      state = decision.next;
      steps.push(state.currentStep);
    }
    assert.deepEqual(steps, ["goal", "experience", "availability", "results"]);
  });

  test("Recommendations: Given a member has answered all three questions, When results show, Then there are two or three options, each with a reason and a verified https link", () => {
    const results = findMatches(approved, careerChanger);
    assert.ok(results.length >= 2 && results.length <= 3, `expected 2 or 3 results, got ${results.length}`);
    assert.match(reasonFor(careerChanger) ?? "", /under 5 hours/);
    for (const item of results) {
      assert.match(item.url, /^https:\/\//);
    }
  });

  test("Recommendations: Given any answers, When FirstStep recommends, Then it only uses approved content and never promises placement", () => {
    for (const goal of GOALS) {
      for (const experience of EXPERIENCE_LEVELS) {
        for (const availability of AVAILABILITY) {
          for (const item of findMatches(approved, { goal, experience, availability })) {
            assert.ok(approvedIds.has(item.id), `${item.id} is not approved content`);
            assert.ok(item.experienceLevels.includes(experience), `${item.id} doesn't fit ${experience}`);
            assert.doesNotMatch(`${item.description} ${item.expected}`, /guarantee|promise you a place/i);
          }
        }
      }
    }
  });

  test("Recommendations: Given a member is new to tech, When results show, Then project training is never recommended", () => {
    for (const goal of GOALS) {
      for (const availability of AVAILABILITY) {
        const ids = findMatches(approved, { goal, experience: "new_to_tech", availability }).map((item) => item.id);
        for (const id of ids) {
          const item = approved.find((o) => o.id === id);
          assert.ok(item?.experienceLevels.includes("new_to_tech"), `${id} was shown to someone new to tech`);
        }
      }
    }
  });
});

describe("Epic 2: Corrections and Fallbacks", () => {
  test("Edit answers: Given a member is looking at results, When they change their hours, Then the answer changes without restarting", () => {
    const decision = decide(atResults, { type: "answer", field: "availability", value: "10_to_20" }, hasMatches);
    assert.equal(decision.ok, true);
    if (!decision.ok) return;
    assert.equal(decision.eventType, "edited");
    assert.equal(decision.next.availability, "10_to_20");
    assert.equal(decision.next.goal, "learning", "the goal was lost");
    assert.equal(decision.next.experience, "new_to_tech", "the experience was lost");
    assert.equal(decision.next.currentStep, "results");
  });

  test("Rephrase: Given FirstStep doesn't understand a message, When it is the first miss, Then it rephrases instead of giving up", () => {
    const first = afterMiss(0);
    assert.equal(first.response, "rephrase");
    assert.notEqual(missReply("goal", first.response), HELP_AFTER_MISSES);
  });

  test("Rephrase: Given FirstStep misunderstands twice, When the second miss happens, Then it offers browse or a person", () => {
    const second = afterMiss(afterMiss(0).missCount);
    assert.equal(second.response, "offer_help");
    assert.equal(missReply("goal", second.response), HELP_AFTER_MISSES);
  });

  test("Honest reply: Given a question outside the approved content, When FirstStep answers, Then it says it doesn't know instead of guessing", () => {
    assert.equal(NO_INFO_REPLY, "I don't have approved information on that, so I don't want to guess.");
  });
});

describe("Epic 3: Human Handoff and Browse View", () => {
  test("Handoff summary: Given a member has answered, When they go to Email a person, Then the summary has their answers and no personal details", () => {
    const summary = handoffSummary({ currentStep: "results", ...careerChanger }, "Preeti");
    assert.match(summary, /Learning/);
    assert.match(summary, /New to tech/);
    assert.match(summary, /Under 5 hours/);
    assert.doesNotMatch(summary, /@|\+?\d[\d\s-]{7,}\d/, "the summary contains an email address or phone number");
  });

  test("Browse view: Given the browse view and the chat, When both show opportunities, Then they come from the same approved content", () => {
    const browsedIds = new Set(
      filterOpportunities(approved, { area: "learning", level: "new_to_tech", hours: "under_5" }).map((item) => item.id),
    );
    const chatted = findMatches(approved, careerChanger, approved.length);
    assert.ok(chatted.length > 0);
    for (const item of chatted) {
      assert.ok(browsedIds.has(item.id), `the chat recommends ${item.id}, but Browse with the same filters doesn't show it`);
    }
    for (const id of browsedIds) assert.ok(approvedIds.has(id));
  });
});
