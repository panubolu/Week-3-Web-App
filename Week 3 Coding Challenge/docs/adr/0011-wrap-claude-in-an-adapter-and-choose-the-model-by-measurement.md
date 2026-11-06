# ADR-0011: Wrap Claude in an Adapter, and choose the model by measurement

## Date and status
November 4, 2026. Proposed.

## Context
Claude is an outside service. Its details should stay in one file, and cost and speed both matter. Prices below are Anthropic list prices for each million tokens, cached October 6, 2026. Confirm them in the Console before budgeting.

| Model | Input | Output | Estimated cost per Claude call | Note |
|---|---|---|---:|---|
| `claude-opus-5-5` | $4.00 | $20.00 | About 1.4 cents | Most capable default. Thinking cannot be turned off, and effort defaults to medium. |
| `claude-sonnet-5-5` | $2.00 | $10.00 | About 0.7 cents | Middle option |
| `claude-haiku-5-5` | $0.10 | $0.50 | About 0.04 cents | Far cheaper. May be plenty for short, structured replies. |

These estimates assume 2,000 input tokens and 300 output tokens per call. Thinking adds output tokens, so real calls may cost more. Measure them.

## Options
- Call the SDK anywhere:
  - Good: quick.
  - Bad: changes spread everywhere.
- Adapter:
  - Good: one file to change, and easy to fake in tests.
  - Bad: one extra file.

## Decision
We will put every Claude call in `src/adapters/claude.ts`, use structured outputs so replies match a fixed format, check the stop reason before reading a reply, and read the model name from `CLAUDE_MODEL`. Start on `claude-opus-5-5` with effort set to low, then run your rule tests on Haiku 5.5. **You choose the model** based on those results.

## Consequences
The Anthropic SDK is the only way the app calls Claude. Switching models is a setting change. Forcing a tool call is not available on Opus 5.5, so structured outputs are the way to get a fixed format. Opus 5.5 can use Anthropic's server-side refusal fallback, but Haiku 5.5 cannot, so the plain server-built reply stays as the backstop on every model. Your API key needs credit in the Anthropic Console, which is the one real cost in this project.
