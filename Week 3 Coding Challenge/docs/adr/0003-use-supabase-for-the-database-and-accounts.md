# ADR-0003: Use Supabase for the database and accounts

## Date and status
November 4, 2026. Accepted.

## Context
The Build Plan allowed Neon or Supabase. The homework requires Supabase. FirstStep's data is structured and connected, so a relational database fits.

## Options
- Supabase:
  - Good: Postgres, accounts and access rules together.
  - Bad: free projects pause after a quiet week.
- Neon:
  - Good: Postgres.
  - Bad: no built-in accounts, and it is not the course tool.

## Decision
We will use Supabase, with access rules on every table.

## Consequences
This replaces the Neon option and `DATABASE_URL`. Free limits are 500 MB and 50,000 monthly active users, far above what FirstStep needs. Each guest counts as a user. Check the project is awake before demos.
