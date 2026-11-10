import assert from "node:assert/strict";
import { test } from "node:test";
import { NO_INFO_REPLY, removeContactDetails } from "./faq.ts";

test("the honest reply uses the exact approved wording", () => {
  assert.equal(NO_INFO_REPLY, "I don't have approved information on that, so I don't want to guess.");
});

test("email addresses are removed before saving", () => {
  assert.equal(
    removeContactDetails("email me at jane.doe+tf@example.co.uk please"),
    "email me at [email removed] please",
  );
});

test("phone numbers are removed before saving", () => {
  assert.equal(removeContactDetails("call +1 (555) 123-4567 or 555.987.6543"), "call [phone removed] or [phone removed]");
});

test("ordinary numbers in a question are kept", () => {
  assert.equal(removeContactDetails("Can I do 15 hours for 8 weeks?"), "Can I do 15 hours for 8 weeks?");
});
