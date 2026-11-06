# ADR-0014: Store no chat transcripts

## Date and status
November 4, 2026. Proposed.

## Context
The specs do not say where conversation history lives, yet TR-16 says to send recent history. Saved transcripts would create the very privacy risk TR-14 is trying to avoid. A history sent from the browser could also be altered.

## Options
- Save every message:
  - Good: full context.
  - Bad: stores free text that may be personal.
- Trust history from the browser:
  - Good: no storage.
  - Bad: can be forged.
- Send Claude only the saved answers, the current step and the new message:
  - Good: smallest, cheapest, most private.
  - Bad: Claude does not remember earlier wording.

## Decision
We will send only structured state plus the new message. This works because the State Machine, not memory, tracks where the member is.

## Consequences
This simplifies TR-16. Restoring progress shows saved answers rather than a replay of the chat. Follow-up questions that depend on earlier wording may need rephrasing.
