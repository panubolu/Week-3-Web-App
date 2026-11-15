import assert from "node:assert/strict";
import { test } from "node:test";
import { checkSkills, REQUIRED_SKILLS, type SkillFiles } from "./skills-check.ts";

const goodSkill = (name: string) => `---
name: ${name}
description: Use whenever building or reviewing something so that it meets the ${name} standard.
---

# ${name}

## Rules

- A rule.

## Checklist before finishing

- [ ] First item
- [ ] Second item
- [ ] Third item

## Reference

A source.
`;

const goodClaudeMd = REQUIRED_SKILLS.map((name) => `.claude/skills/${name}/SKILL.md`).join("\n");
const allGood = (): SkillFiles => ({
  skills: Object.fromEntries(REQUIRED_SKILLS.map((name) => [name, goodSkill(name)])),
  claudeMd: goodClaudeMd,
});

test("four healthy skills pass", () => {
  assert.deepEqual(checkSkills(allGood()), []);
});

test("a missing skill fails", () => {
  const files = allGood();
  files.skills.security = null;
  assert.match(checkSkills(files).join("\n"), /security: .*missing/);
});

test("a skill without its checklist fails", () => {
  const files = allGood();
  files.skills["ux-design"] = goodSkill("ux-design").replace("## Checklist before finishing", "## Notes");
  assert.match(checkSkills(files).join("\n"), /ux-design: the "## Checklist before finishing" section is missing/);
});

test("a checklist with too few items fails", () => {
  const files = allGood();
  files.skills.performance = goodSkill("performance").replace("- [ ] Second item\n- [ ] Third item\n", "");
  assert.match(checkSkills(files).join("\n"), /performance: the checklist has 1 items/);
});

test("a wrong frontmatter name fails", () => {
  const files = allGood();
  files.skills.accessibility = goodSkill("accessibility").replace("name: accessibility", "name: a11y");
  assert.match(checkSkills(files).join("\n"), /accessibility: frontmatter name is "a11y"/);
});

test("a missing description fails", () => {
  const files = allGood();
  files.skills.security = goodSkill("security").replace(/^description:.*$/m, "description: Security");
  assert.match(checkSkills(files).join("\n"), /security: frontmatter description/);
});

test("CLAUDE.md that stops pointing at a skill fails", () => {
  const files = allGood();
  files.claudeMd = goodClaudeMd.replace(".claude/skills/performance/SKILL.md", "");
  assert.match(checkSkills(files).join("\n"), /performance: CLAUDE.md no longer points/);
});
