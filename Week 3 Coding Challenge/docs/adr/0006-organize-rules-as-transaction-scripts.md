# ADR-0006: Organize rules as Transaction Scripts

## Date and status
November 4, 2026. Proposed.

## Context
FirstStep's rules are few and simple.

## Options
- Transaction Script:
  - Good: easiest.
  - Bad: can tangle as rules grow.
- Domain Model:
  - Good: grows well.
  - Bad: more effort than these rules need.
- Table Module:
  - Good: keeps one table's logic together.
  - Bad: suited to table-based tools we are not using.

## Decision
We will use one script per user action, calling small pure functions in `src/domain`.

## Consequences
No separate Service Layer is needed. If rules start being copied between scripts, write a new ADR and move toward a Domain Model.
