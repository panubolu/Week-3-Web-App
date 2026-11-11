# ADR-0008: Server-first screens, with no database calls from the browser

## Date and status
November 4, 2026. Accepted by Preeti Anubolu on November 10, 2026.

## Context
The class rule is that the screen never talks to the database. Speed targets also favor sending less JavaScript.

## Options
- Browser calls Supabase directly:
  - Good: less server code.
  - Bad: this is two-tier, and it breaks the class rule.
- All calls through the server:
  - Good: one place to check everything.
  - Bad: an extra hop.

## Decision
We will render pages on the server where possible and send all data through server routes. The chat is the main client component. Access rules stay on as a second lock.

## Consequences
No browser Supabase client exists, so session cookies can be set to HttpOnly. Confirm this works during the first build. If it does not, record it as a new ADR.
