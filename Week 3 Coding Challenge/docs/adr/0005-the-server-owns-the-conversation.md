# ADR-0005: The server owns the conversation

## Date and status
November 4, 2026. Accepted by Preeti Anubolu on November 10, 2026.

## Context
TR-03 has Claude return the current step. That makes every turn depend on Claude, and it lets a model error change the flow. The lecture pairs "something that moves through stages" with a State Machine.

## Options
- Claude controls the flow:
  - Good: less code.
  - Bad: every step costs money, adds delay and can drift.
- The server controls the flow:
  - Good: predictable, cheaper, works during outages.
  - Bad: more code, and less free-flowing chat.

## Decision
We will run the conversation as a State Machine on the server. Claude interprets typed text, answers within approved content and writes reasons. It proposes, and the server decides.

## Consequences
This updates TR-03. Button answers need no Claude call. All step rules can be tested for free. Conversations feel more guided than open chat, which matches the vision.
