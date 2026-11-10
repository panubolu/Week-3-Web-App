import assert from "node:assert/strict";
import { test } from "node:test";
import { ANSWER_LABELS } from "../../domain/handoff.ts";
import { QUESTIONS } from "./questions.ts";

test("the handoff summary uses the same labels as the answer buttons", () => {
  for (const question of QUESTIONS) {
    const fromButtons = Object.fromEntries(question.options.map((option) => [option.value, option.label]));
    assert.deepEqual(ANSWER_LABELS[question.field], fromButtons, `${question.field} labels differ`);
  }
});
