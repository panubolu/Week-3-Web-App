import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { z } from "zod";
import {
  askClaude,
  askWith,
  ClaudeTimeoutError,
  ClaudeUnavailableError,
  type CallModel,
  type ModelReply,
} from "./claude.ts";

// A fake Claude: replays the given replies (or errors) in order and counts calls.
function fakeClaude(...steps: Array<ModelReply | Error>) {
  const fake = {
    calls: 0,
    call: (async () => {
      const step = steps[Math.min(fake.calls, steps.length - 1)];
      fake.calls += 1;
      if (step instanceof Error) throw step;
      return step;
    }) as CallModel,
  };
  return fake;
}

const reply = (text: string, stopReason: string | null = "end_turn"): ModelReply => ({
  text,
  stopReason,
  model: "fake-claude",
});

const request = {
  purpose: "test",
  system: "Rules",
  message: "Member text",
  jsonSchema: { type: "object" },
  validate: z.strictObject({ value: z.enum(["learning", "not_sure"]) }),
};

const original = { info: console.info, warn: console.warn };
beforeEach(() => {
  console.info = () => {};
  console.warn = () => {};
});
afterEach(() => {
  console.info = original.info;
  console.warn = original.warn;
});

test("a valid reply is returned after one call", async () => {
  const claude = fakeClaude(reply('{"value":"learning"}'));
  assert.deepEqual(await askWith(claude.call, request), { ok: true, data: { value: "learning" } });
  assert.equal(claude.calls, 1);
});

test("a reply in the wrong format is retried once, then accepted", async () => {
  const claude = fakeClaude(reply("not json"), reply('{"value":"not_sure"}'));
  assert.deepEqual(await askWith(claude.call, request), { ok: true, data: { value: "not_sure" } });
  assert.equal(claude.calls, 2);
});

test("two bad replies give up after the one retry", async () => {
  const claude = fakeClaude(reply('{"value":"made up"}'));
  assert.deepEqual(await askWith(claude.call, request), { ok: false, reason: "bad_format" });
  assert.equal(claude.calls, 2);
});

test("a reply cut off by the token limit counts as the wrong format", async () => {
  const claude = fakeClaude(reply('{"value":"learning"}', "max_tokens"), reply('{"value":"learning"}'));
  assert.deepEqual(await askWith(claude.call, request), { ok: true, data: { value: "learning" } });
  assert.equal(claude.calls, 2);
});

test("a timeout stops right away with no retry", async () => {
  const claude = fakeClaude(new ClaudeTimeoutError());
  assert.deepEqual(await askWith(claude.call, request), { ok: false, reason: "timeout" });
  assert.equal(claude.calls, 1);
});

test("an error such as a bad API key stops right away with no retry", async () => {
  const claude = fakeClaude(new ClaudeUnavailableError("status 401"));
  assert.deepEqual(await askWith(claude.call, request), { ok: false, reason: "unavailable" });
  assert.equal(claude.calls, 1);
});

test("a refusal is caught before the reply is read", async () => {
  const claude = fakeClaude(reply('{"value":"learning"}', "refusal"));
  assert.deepEqual(await askWith(claude.call, request), { ok: false, reason: "refusal" });
  assert.equal(claude.calls, 1);
});

test("with no API key, Claude is skipped without a call", async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    assert.deepEqual(await askClaude(request), { ok: false, reason: "not_configured" });
  } finally {
    if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
  }
});
