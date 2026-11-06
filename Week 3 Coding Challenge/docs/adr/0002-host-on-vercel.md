# ADR-0002: Host on Vercel

## Date and status
November 4, 2026. Accepted.

## Context
The app must be on the internet with server code that keeps keys private.

## Options
- Vercel:
  - Good: built for Next.js, preview links, free.
  - Bad: free-plan logs last 1 hour.
- Self-hosting:
  - Good: full control.
  - Bad: you maintain the machines forever.

## Decision
We will host on Vercel, because it requires the least upkeep and is the course standard.

## Consequences
Pull requests get preview links. Moving hosts later takes work. Check logs soon after a problem.
