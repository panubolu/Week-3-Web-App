# ADR-0009: US East region, with defined timeouts and fallbacks

## Date and status
November 4, 2026. Accepted by Preeti Anubolu on November 5, 2026.

## Context
The server and database should sit close together, and failures need a plan.

## Options
- Same region:
  - Good: fast database calls.
  - Bad: slower for members far from it.
- Different regions:
  - Good: each service could sit in its cheapest place.
  - Bad: every database call crosses a long distance.

## Decision
We will run Vercel functions and Supabase in US East, unless you know most members are elsewhere. Claude calls time out at 10 seconds and fall back to a plain reply.

## Consequences
A Supabase region cannot easily be changed later, so confirm it before creating the project.
