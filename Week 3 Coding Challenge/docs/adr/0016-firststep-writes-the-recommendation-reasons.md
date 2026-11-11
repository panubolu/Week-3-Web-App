# ADR-0016: FirstStep writes the recommendation reasons, not Claude (for MVP #1)

## Date and status
November 10, 2026. Accepted by Preeti Anubolu on November 10, 2026.

## Context
T-16 planned for Claude to write the one-line "Why it fits" reason on each recommendation card, with a plain server-built reason as the fallback. While building MVP #1, a rule emerged and held across every Claude feature (typed answers T-15, honest replies T-20, help after misses T-19, typed changes T-42): **Claude only sorts the member's words into fixed choices, and members see only FirstStep's own approved wording.** That rule is why FirstStep can promise that no Claude-written text can invent a link, promise a place, or drift off topic. The rule tests (36 of 36) prove it.

FirstStep already shows a correct reason built from the member's answers, for example "It's open to people new to tech, and it fits your under 5 hours a week."

## Options
- **Claude writes the reasons:**
  - Good: more personal wording.
  - Bad: the first Claude-written text members would see. It would need checks for links, promises, length and tone, plus new rule tests. It also costs one Claude call (about 1 to 2 cents) and about 2 seconds every time results load, and uses part of each member's hourly limit.
- **FirstStep writes the reasons (current):**
  - Good: always accurate, instant and free, and the safety rule stays simple and fully true.
  - Bad: the wording repeats across cards.

## Decision
Keep the reasons FirstStep builds itself (`reasonFor` in `src/domain/opportunities.ts`) for MVP #1. Claude-written reasons move to the version 2 backlog (T-37), to be reconsidered after real-person testing (T-35) shows whether members want more personal reasons.

## Consequences
- T-16 is closed for MVP #1 with this decision.
- The Claude adapter, the usage limits and the rule tests already exist, so adding Claude-written reasons later is a contained change. If it's built, it needs:
  - checks that reject any reason with a link, a promise of placement, or more than one sentence;
  - the current reason as the fallback;
  - new rule tests.
