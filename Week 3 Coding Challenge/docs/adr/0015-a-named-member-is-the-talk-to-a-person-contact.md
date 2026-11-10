# ADR-0015: A named member is the "Talk to a person" contact, with Tech Fleet as backup

## Date and status
November 9, 2026. Accepted by Preeti Anubolu on November 9, 2026.

## Context
UR-10 promises a real person one click away, on every step. The teacher asked us to take content from Tech Fleet's public platform. That gives a general contact: the Contact Us page (https://techfleet.org/contact), with the email info@techfleet.org and a Discord. A general inbox may answer slowly, and it doesn't know what FirstStep is. Preeti is a Tech Fleet member and a former project coordinator, so she can answer FirstStep members herself.

## Options
- Tech Fleet's Contact Us page only:
  - Good: official, and always staffed by Tech Fleet.
  - Bad: general, and doesn't know FirstStep.
- Preeti's personal email:
  - Good: no setup.
  - Bad: a public repo and site expose her personal inbox to spam.
- **A separate FirstStep email for Preeti, with the Contact Us page as backup:**
  - Good: a person who knows FirstStep answers, and her personal inbox stays private. Someone can still help if she is away.
  - Bad: one more inbox to check.

## Decision
"Talk to a person" opens a FirstStep page (`/talk-to-a-person`). It shows Preeti's FirstStep email, as a mailto link and as copyable text, and then "contact the Tech Fleet team", linking to the Contact Us page. The contact lives in `content/opportunities.json`, so the page is static and works when the database or Claude is down. A test fails the build if the email is still a placeholder.

## Consequences
The address is public in the repo and on the site. Preeti should check the inbox regularly while FirstStep is in use. If she steps away, change `coordinator` in the content file to Tech Fleet's contact, with no code change. Clicks are recorded in `handoffs` with the step only, never the message.
