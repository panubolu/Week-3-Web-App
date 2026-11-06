# ADR-0013: Build a simple browse view in MVP #1

## Date and status
November 4, 2026. Accepted by Preeti Anubolu on November 5, 2026, pending your teacher's answer on whether browse must save to Supabase.

## Context
UR-12 is a "Could" and the Build Plan moves browse to later. But UR-07 and UR-09 are "Must" and both offer browse, and the homework forbids anything fake or "coming soon".

## Options
- Remove browse from those fallbacks:
  - Good: less work.
  - Bad: fewer ways out, and no alternative to chat.
- Build a simple view:
  - Good: fallbacks work, and it gives screen reader users an alternative.
  - Bad: one more screen.

## Decision
We will build a server-rendered `/browse` page from the same content file, with level and hours filters.

## Consequences
UR-12 moves up to MVP #1. It is a low-cost screen with no Claude calls and no database use. Move the role filter and any polish to the MMP if time runs short.
