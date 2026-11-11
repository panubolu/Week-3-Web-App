import { test } from "node:test";
import assert from "node:assert/strict";
import { primaryGoogleMode } from "./sign-in.ts";

test("Save my progress is the main button by default", () => {
  assert.equal(primaryGoogleMode(undefined), "save");
  assert.equal(primaryGoogleMode("canceled"), "save");
  assert.equal(primaryGoogleMode("failed"), "save");
});

test("Signing in is the main button when the Google account already has saved progress", () => {
  assert.equal(primaryGoogleMode("already-saved"), "sign-in");
});
