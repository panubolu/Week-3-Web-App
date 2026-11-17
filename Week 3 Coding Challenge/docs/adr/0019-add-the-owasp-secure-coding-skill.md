# ADR-0019: Add my teacher's OWASP secure-coding skill, without its scripts or a hook (for now)

## Date and status
November 16, 2026. Accepted by Preeti Anubolu on November 16, 2026. Preparation for Week 6 (Security Test a Code Base).

## Context
Week 6 asks for a security test (PenTest) of FirstStep using the OWASP testing guide, a report with findings ranked P0 to P3, and BDD scenarios added to CI. My teacher published an OWASP secure-coding skill, `owasp-secure-coding-bdd`, in `techfleetworks/enterprise-software-AI-skills` (commit `11a64f3`, November 4, 2026). It has 160 files: a `SKILL.md`, one short guide per OWASP cheat sheet (141 files), example `@security` feature files, and five Node scripts.

A downloaded skill is code and instructions Claude will follow, so before adding it, every file was reviewed:
- The four scripts in `scripts/` only read local files and print pass or fail. They never start other programs or use the network.
- `tools/vendor-owasp.mjs` is the only file that uses the network: it downloads the original OWASP text from OWASP's GitHub into the skill's `vendor/` folder.
- The cheat sheets were searched for hidden instructions and dangerous commands; the only matches were example attacks the sheets teach about.

My teacher also reminded us that a skill in the folder is not used automatically: Claude picks a skill only when its description seems to match, and a hook is the way to make it always on.

## Options
- Don't add it; keep only the Week 1 Security skill:
  - Good: nothing new to maintain.
  - Bad: the Week 1 skill covers the OWASP Top 10 only; it has nothing on prompt injection, Next.js, Supabase sessions or GitHub Actions, which Week 6 needs.
- Add the skill, its CI gate and an always-on hook:
  - Good: the most enforcement.
  - Bad: the gate's patterns are tuned for apps that write raw SQL and would raise false alarms on FirstStep (for example on JavaScript's `.exec(`); a hook changes how every Claude session works and deserves its own decision.
- Add the skill only, linked from CLAUDE.md (chosen):
  - Good: Claude can use all 137 cheat sheets for Week 6; CLAUDE.md tells it when; nothing new runs.
  - Bad: Claude may still miss the skill on a task whose wording doesn't match; its `@security` scenarios are not checked in CI yet.

## Decision
Copy the folder unchanged to `.claude/skills/owasp-secure-coding-bdd/` and add it to CLAUDE.md, to be used together with the Security skill. Its `@security` scenarios are written as tests in this repo's own BDD suite (`src/bdd/`), which already runs in CI. Its scripts and the download tool are not run without asking first. The CI Skills gate (ADR-0018) keeps checking the four Week 1 skills only, because this skill uses a different checklist heading ("Before you call it done") and should stay identical to my teacher's copy.

## Consequences
- Week 6 can use the cheat sheets that matter most for FirstStep: LLM Prompt Injection Prevention (the Claude classifier), Next.js Security, Session Management and OAuth2 (Supabase and Google sign-in), GitHub Actions Security (CI), and the lockout-prevention guide for RLS and key changes.
- Updating the skill means copying a newer commit from my teacher's repository and reviewing the changes again.
- Still open, as later decisions: an always-on hook in `.claude/settings.json`, and the skill's coverage gate tuned for FirstStep's stack.
