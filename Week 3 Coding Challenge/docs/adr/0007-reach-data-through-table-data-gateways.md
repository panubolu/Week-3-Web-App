# ADR-0007: Reach data through Table Data Gateways

## Date and status
November 4, 2026. Accepted by Preeti Anubolu on November 10, 2026.

## Context
The lecture matches Transaction Scripts with Gateways. Database code must stay in one place.

## Options
- Table Data Gateway:
  - Good: simple, one file per table.
  - Bad: a little repetition.
- Query the database anywhere:
  - Good: fast at first.
  - Bad: gets tangled, and is hard to secure.

## Decision
We will put all database access in `src/data`, using the Supabase client with the signed-in person's session.

## Consequences
Access rules apply to every query. Changing a table means changing one known file. Migrations in `supabase/migrations` hold the history.
