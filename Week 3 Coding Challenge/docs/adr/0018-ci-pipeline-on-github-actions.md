# ADR-0018: A CI pipeline on GitHub Actions, with checks from the Week 2 requirements

## Date and status
November 15, 2026. Accepted by Preeti Anubolu on November 15, 2026. Week 5 homework (Build a CI/CD Pipeline).

## Context
FirstStep is live, and it keeps changing (version 2 shipped on November 12). Until now, checks ran only on Preeti's computer before each pull request, so a change could reach `main` (and Vercel) without anyone running them. The Week 5 homework asks for a CI/CD pipeline on GitHub Actions that runs on every push, uses the use cases and BDD scenarios from the Week 2 requirements, gate-checks the Week 1 Claude Skills, has at least three checks, and fails when something is broken. The repository is on GitHub's free plan, so branch protection is not required.

The outcome: every push should catch new bugs and regressions before they reach members, and keep the code following the coding, accessibility and skill standards.

## Options
- Run everything, including the slow and costly tests, on every push:
  - Good: the most coverage.
  - Bad: the Claude rule tests would need the Anthropic key on GitHub and cost money on every push; the live isolation test would create data in the real database. Against the testing pyramid: slow tests on every push.
- No CI, keep checking by hand:
  - Good: no setup.
  - Bad: nothing stops an unchecked change reaching members; doesn't meet the homework.
- A pyramid-shaped pipeline with five fast checks (chosen):
  - Good: many fast unit and BDD tests, one build and smoke test, a skills gate and a security check; no secrets on GitHub; runs in a few minutes.
  - Bad: Claude's own behavior and the live database rules are still checked by hand.

## Decision
One workflow, `.github/workflows/ci.yml`, runs on every push to any branch and on pull requests into `main`, with five checks that run in parallel (a sixth, the coverage gate, was added on November 16; see the update below):

1. **Code standards:** ESLint and TypeScript (`npm run lint`, `npm run typecheck`).
2. **Unit and BDD tests:** `npm test`, including the existing unit and regression tests and `src/bdd/week2-scenarios.test.ts`, where each test is a Week 2 use case scenario written as Given / When / Then, run against the real approved content.
3. **Build and smoke test:** `next build`, then start the app and check that the home, Browse, Email a person, Privacy and Save my progress pages load with their headings.
4. **Claude Skills gate:** `npm run check-skills` checks that the four Week 1 skills (accessibility, performance, security, ux-design) each have their name, a description, and a "Checklist before finishing" with at least three items, and that `CLAUDE.md` still points at each one. The rules are in `src/quality/skills-check.ts`, with their own unit tests.
5. **Security:** `npm audit --omit=dev --audit-level=high` fails on high or critical vulnerabilities in the app's dependencies, and a step fails if any `.env` file other than `.env.example` is committed.

The workflow has read-only permissions and uses placeholder public Supabase settings so the app can build. No real keys are stored on GitHub.

**CD:** Vercel keeps deploying `main` automatically. The rule, without branch protection: if a check is red, don't merge; fix it first. After a change is live, the two manual test case scenarios are run by hand.

**Kept out of CI, run by hand:** the Claude rule tests (`npm run rule-tests`), because they need the API key and cost money per run, and the data isolation test (`npm run isolation-test`), because it writes to the live database.

## Consequences
- Every push gets five checks in GitHub's Actions tab; a broken BDD scenario, build, skill file or dependency turns the run red.
- New Week 2 behaviors should get a BDD test in `src/bdd/` as they're built.
- Development-only tools currently have 7 moderate audit warnings, below the "high" line; review them when updating dependencies.
- If the repository moves to a paid plan, turn on branch protection so red checks block merging automatically.
- Because Vercel sometimes missed a merge (PRs #28 and #30), still check the Deployments page after merging.

## Update, November 16, 2026: a sixth check, the test coverage gate
Accepted by Preeti Anubolu on November 16, 2026. The "How to Create a CI / CD Pipeline on GitHub" guide lists "CI gate checks": a threshold that fails the build when a number crosses a line, such as test coverage dropping too low, added once there is a set of tests. With 102 tests, that time has come.

6. **Test coverage gate:** `npm run test:coverage` runs the same tests with Node's built-in coverage (no new packages) and fails if the code the tests load drops below **90% of lines, 85% of branches, or 85% of functions**. On November 16 it measured 95.2% lines, 92.4% branches and 90.6% functions, so the lines sit a few points below today's numbers: a small change won't trip it, but new logic added without tests will. Raised to 99% as a test, it failed as expected ("95.24% line coverage does not meet threshold of 99%").

Honest limit: Node only counts files the tests import (the rules in `src/domain`, `src/adapters`, `src/data` and `src/quality`). The React screens aren't loaded by unit tests, so they don't count. A screen is covered by the smoke test and the manual test cases instead. Raise the thresholds as coverage grows; never lower them just to make a red run pass.
