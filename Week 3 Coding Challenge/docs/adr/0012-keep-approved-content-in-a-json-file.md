# ADR-0012: Keep approved content in a JSON file

## Date and status
November 4, 2026. Proposed.

## Context
TR-06 and TR-17 put content in one file. Opportunities are public, change occasionally, and must match in chat and browse.

## Options
- JSON file in the repo:
  - Good: reviewed, versioned, simple.
  - Bad: updates need a deploy.
- Database table:
  - Good: editable without a deploy.
  - Bad: needs an admin screen, and adds a load step.

## Decision
We will keep `content/opportunities.json`, validate it automatically during the build, and require an `https` link and last-verified date on each entry.

## Consequences
A broken content file fails the build instead of reaching members. Non-developers cannot update it without help, which is a known limit until the MMP. Opportunities are not stored in Supabase, so confirm this with your teacher against "Every feature saves its information to Supabase".
