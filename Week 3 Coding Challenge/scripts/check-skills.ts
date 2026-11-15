// CI gate: checks the Week 1 Claude Skills on every push (ADR-0018).
// Run from the app folder: node scripts/check-skills.ts
// Exits with code 1 (a red CI check) if any skill is broken.

import { existsSync, readFileSync } from "node:fs";
import { checkSkills, REQUIRED_SKILLS } from "../src/quality/skills-check.ts";

const repoRoot = new URL("../../", import.meta.url);
const read = (path: string) => {
  const file = new URL(path, repoRoot);
  return existsSync(file) ? readFileSync(file, "utf8") : null;
};

const problems = checkSkills({
  skills: Object.fromEntries(REQUIRED_SKILLS.map((name) => [name, read(`.claude/skills/${name}/SKILL.md`)])),
  claudeMd: read("CLAUDE.md") ?? "",
});

if (problems.length > 0) {
  console.error(`Claude Skills gate FAILED (${problems.length} problem${problems.length === 1 ? "" : "s"}):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`Claude Skills gate passed: ${REQUIRED_SKILLS.join(", ")} are complete and linked from CLAUDE.md.`);
