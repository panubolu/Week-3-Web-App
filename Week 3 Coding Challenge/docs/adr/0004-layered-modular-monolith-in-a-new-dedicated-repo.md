# ADR-0004: Layered modular monolith in a new, dedicated repo

## Date and status
November 4, 2026. Accepted by Preeti Anubolu, pending the teacher check below.

## Context
One student and Claude are building this in a week. The lecture says to keep the app in one place unless a need forces a split. The class materials disagree about the repo: the homework says to reuse the Week 2 repo and not make a new one, while the lecture's launch steps say to put the app in a new repository. The Build Plan named `panubolu/AI-Development-Residency`, which holds coursework and skills rather than an app. The repo named in the homework does not exist on this GitHub account.

## Options
- Microservices:
  - Good: parts scale alone.
  - Bad: far too much work, and every network call can fail.
- Plain monolith:
  - Good: fastest.
  - Bad: gets tangled.
- Layered modular monolith:
  - Good: one deploy with tidy walls.
  - Bad: walls need discipline.

## Decision
We will build one Next.js app with the folder walls in Step 9, inside the `Week 3 Coding Challenge` folder of a new, dedicated public repository, [panubolu/Week-3-Web-App](https://github.com/panubolu/Week-3-Web-App), so the app's history and Vercel project stay separate from other coursework. The repo was renamed from `firststep` on November 5, 2026, to match the class requirement for a repo called "Week 3 Web App". GitHub does not allow spaces in names.

## Consequences
The class submission steps ask for the week's code inside this folder, so Vercel's Root Directory must point to `Week 3 Coding Challenge`. If your teacher confirms a different folder name, update that setting. Vercel rejects function paths containing spaces, so `next.config.ts` sets `outputFileTracingRoot` to the app folder. The four skills, the project instructions in `CLAUDE.md`, and these documents must be copied into the new repo. The Build Plan's repo row needs updating. The new repo must stay public or be shared with your teacher, and your teacher should be told why it differs from the homework's instruction.
