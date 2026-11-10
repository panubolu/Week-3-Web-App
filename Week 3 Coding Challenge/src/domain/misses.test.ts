import assert from "node:assert/strict";
import { test } from "node:test";
import { afterMiss, HELP_AFTER_MISSES, MISS_COUNT_AFTER_ANSWER, missReply } from "./misses.ts";

test("the first miss rephrases the question", () => {
  assert.deepEqual(afterMiss(0), { missCount: 1, response: "rephrase" });
});

test("the second miss offers browse or a person", () => {
  assert.deepEqual(afterMiss(1), { missCount: 2, response: "offer_help" });
});

test("later misses keep offering help, never a loop of rephrasing", () => {
  assert.deepEqual(afterMiss(2), { missCount: 3, response: "offer_help" });
  assert.deepEqual(afterMiss(7), { missCount: 8, response: "offer_help" });
});

test("a successful answer resets the count, so the next miss rephrases again", () => {
  assert.equal(MISS_COUNT_AFTER_ANSWER, 0);
  assert.equal(afterMiss(MISS_COUNT_AFTER_ANSWER).response, "rephrase");
});

test("a bad stored count is treated as zero", () => {
  assert.deepEqual(afterMiss(-3), { missCount: 1, response: "rephrase" });
});

test("each question has its own rephrase, and help has its own wording", () => {
  assert.match(missReply("goal", "rephrase"), /real project/);
  assert.match(missReply("experience", "rephrase"), /bootcamp/);
  assert.match(missReply("availability", "rephrase"), /hours/);
  assert.equal(missReply("goal", "offer_help"), HELP_AFTER_MISSES);
});

test("on the results screen, a miss explains what typing can do", () => {
  assert.match(missReply(null, "rephrase"), /Actually I have 5 hours/);
  assert.equal(missReply(null, "offer_help"), HELP_AFTER_MISSES);
});
