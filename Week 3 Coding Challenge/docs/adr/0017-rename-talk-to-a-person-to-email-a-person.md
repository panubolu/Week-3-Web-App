# ADR-0017: Rename "Talk to a person" to "Email a person", and show it inside the conversation

## Date and status
November 12, 2026. Accepted by Preeti Anubolu on November 12, 2026. Version 2, from the first usability test (T-35, T-36). Updates the wording in ADR-0015; the contact itself does not change.

## Context
In the first usability test, P1 (desktop, large monitor) found "Talk to a person" hard to find at the far right of the top bar ("it is difficult to navigate. I might use it often"), and discovered that it opens an email rather than a live chat. P1 suggested renaming it "Support" or "Email support". The welcome message also promised that "a real person is available at any time", which suggests an instant reply.

ADR-0015 made a named Tech Fleet member the contact, reached by email. That decision stands. Only the wording and placement change.

## Options
- Keep "Talk to a person":
  - Good: no change; matches the Week 2 specs and positioning pages.
  - Bad: sets the wrong expectation (live chat), and was hard to find.
- "Support" or "Email support" (P1's suggestion):
  - Good: clear that it's email.
  - Bad: sounds like a company help desk, and loses FirstStep's promise of a real community member.
- "Email a person":
  - Good: says it's email and keeps the human promise that sets FirstStep apart from Fleety and chatbots.
  - Bad: "Talk to a person" stays in older documents and ADRs, so both names exist in the history.

## Decision
Use "Email a person" everywhere a member sees it: the header link, the page title and heading, links inside FirstStep's replies, Browse, and Privacy. The welcome message says a person can help by email. A new "Need help? Email a person" link sits inside the conversation, below the questions and the results, so it's near where members are working on any screen size.

The page address stays `/talk-to-a-person`, so existing links and bookmarks keep working, and the `handoffs` table keeps its name.

## Consequences
- Members know before they click that help comes by email.
- The help link is next to the content, not only in the far corner of the header.
- Older documents (Week 2 specs, positioning pages, ADR-0015) still say "Talk to a person". They describe version 1 and stay as they are; new documents use "Email a person".
- The sample dialogues and accessibility checks are updated to the new wording.
- Test again with a second participant (P2) to confirm the new wording and placement work.
