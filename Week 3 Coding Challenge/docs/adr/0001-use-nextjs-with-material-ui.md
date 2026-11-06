# ADR-0001: Use Next.js with Material UI

## Date and status
November 4, 2026. Accepted.

## Context
FirstStep needs screens and server code, and the course requires this stack.

## Options
- Plain React:
  - Good: simple front end.
  - Bad: needs a separate place for server code.
- Next.js:
  - Good: screens and server code in one project.
  - Bad: you must learn what runs where.

## Decision
We will use Next.js with TypeScript and Material UI, because they cover two of our three tiers in one project and meet the course requirement.

## Consequences
The theme file needs a `"use client"` line, and Material UI needs its Next.js cache provider. Every screen uses the same components. Material UI adds JavaScript, so only the chat is a client component.
