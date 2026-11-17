# AI Development Residency

This repository holds my coursework for the AI Development Residency. The goal is enterprise-ready software: usable, accessible, secure, and fast.

## Required skills (always apply)

This project has four skills in `.claude/skills/`. They are **mandatory**, not optional. Before starting any task, decide which of them apply, read their `SKILL.md`, and follow their rules and checklists.

| Skill | File | Apply when the task involves |
|---|---|---|
| UX design | `.claude/skills/ux-design/SKILL.md` | Any screen, page, flow, form, or feature a person uses |
| Accessibility | `.claude/skills/accessibility/SKILL.md` | Any user interface: HTML, components, colors, images, forms |
| Security | `.claude/skills/security/SKILL.md` | Input, logins, data, secrets, APIs, databases, dependencies |
| Performance | `.claude/skills/performance/SKILL.md` | Pages, images, scripts, data fetching, anything deployed |

### Secure coding with OWASP (from my teacher)

`.claude/skills/owasp-secure-coding-bdd/SKILL.md` is my teacher's OWASP secure-coding skill (techfleetworks/enterprise-software-AI-skills, commit `11a64f3`, reviewed before adding; see ADR-0019). Apply it **together with** the Security skill on any change that touches input, sign-in, sessions, access rules (RLS), secrets, APIs, dependencies, CI, or the Claude classifier, and for security testing (Week 6).

- Use its catalog to pick the matching cheat sheets in `references/cheatsheets/`, then follow its threat-modeling steps and "Before you call it done" checklist.
- Its `@security` scenarios become tests in this repo's own BDD suite (`src/bdd/`), which already runs in CI. The companion skills it names (`bdd-comprehensive-testing`, `skeptical-audit`, `judge-arch`) are not installed here.
- Do **not** run its scripts or `tools/vendor-owasp.mjs` (the one that downloads from the internet) without asking me first. They are not wired into CI yet.

## How to use them

1. **At the start of every task**, state in one line which skills apply (for example: "Skills: UX, Accessibility, Security").
2. **Read** each applicable `SKILL.md` before writing code; do not rely on memory of it.
3. **Before finishing**, run each applicable skill's "Checklist before finishing" and report the result of every item.
4. If a rule cannot be met, say which rule and why. Never skip a rule silently.
5. When rules conflict, priority is: **Security → Accessibility → UX → Performance**.

## Architecture decisions

Read every ADR in docs/adr before making changes, and write a new ADR for every big decision.

The app and its `docs` folder live inside `Week 3 Coding Challenge`, so the ADRs are at `Week 3 Coding Challenge/docs/adr`.

## Working in this repository

- Make changes on a branch, never directly on `main`; merge through a pull request.
- Explain what each Git command does when asking me to run it. I am learning.
