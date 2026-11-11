# ADR-0011: Wrap Claude in an Adapter, and choose the model by measurement

## Date and status
November 4, 2026. Accepted by Preeti Anubolu on November 9, 2026, choosing `claude-opus-5-5` (see the decision below).

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

## Measurements so far (November 9, 2026)
The adapter (T-14) was timed with one simple request: sorting "I'd like to learn new skills" into a goal, 3 runs per model at effort low.

| Model | Correct | Average time |
|---|---|---|
| `claude-opus-5-5` | 3 of 3 | about 1.7 seconds |
| `claude-haiku-5-5` | 3 of 3 | about 1.2 seconds |

One easy request can't separate the models on quality. Keep `claude-opus-5-5` until the rule tests for typed answers (T-15) and the system prompt (T-38) exist. Then run them on both models, and Preeti chooses.

**Rule tests, November 9, 2026** (`npm run rule-tests`, 22 cases: 18 ordinary answers and 4 attempts to break the rules):

| Model | Passed | Median time | Slowest | Missed |
|---|---|---|---|---|
| `claude-opus-5-5` | 22 of 22 | 1.8 seconds | 2.4 seconds | none |
| `claude-haiku-5-5` | 21 of 22 | 1.1 seconds | 3.5 seconds | "an hour a day" saved as under 5 hours (it is about 7) |

Both models blocked all four attempts to break the rules. `claude-opus-5-5` stays the default until Preeti chooses.

**Decision, November 9, 2026:** Preeti chose to keep `claude-opus-5-5`. It was the only model with a perfect score, the cost at homework scale is a dollar or two, and both models reply well within the 3-second target. Revisit `claude-haiku-5-5` if typed traffic grows large, after improving per-day hour conversion in the instructions and re-running the rule tests.

## Consequences
The Anthropic SDK is the only way the app calls Claude. Switching models is a setting change. Forcing a tool call is not available on Opus 5.5, so structured outputs are the way to get a fixed format. Opus 5.5 can use Anthropic's server-side refusal fallback, but Haiku 5.5 cannot, so the plain server-built reply stays as the backstop on every model. Your API key needs credit in the Anthropic Console, which is the one real cost in this project.
