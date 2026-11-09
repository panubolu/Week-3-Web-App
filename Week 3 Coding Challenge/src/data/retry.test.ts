import assert from "node:assert/strict";
import { test } from "node:test";
import { withOneRetry } from "./retry.ts";

const quiet = () => {
  const original = console.warn;
  console.warn = () => {};
  return () => {
    console.warn = original;
  };
};

test("a write that works runs once", async () => {
  let calls = 0;
  assert.equal(await withOneRetry(async () => ++calls, 0), 1);
  assert.equal(calls, 1);
});

test("a write that fails once is retried and succeeds", async () => {
  const restore = quiet();
  let calls = 0;
  const result = await withOneRetry(async () => {
    calls += 1;
    if (calls === 1) throw new Error("blip");
    return "saved";
  }, 0);
  restore();
  assert.equal(result, "saved");
  assert.equal(calls, 2);
});

test("a write that keeps failing is tried only twice, then fails", async () => {
  const restore = quiet();
  let calls = 0;
  await assert.rejects(
    withOneRetry(async () => {
      calls += 1;
      throw new Error("down");
    }, 0),
    /down/,
  );
  restore();
  assert.equal(calls, 2);
});
