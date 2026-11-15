// Gate check for the Claude Skills made in Week 1 (Week 5, ADR-0018).
//
// CLAUDE.md tells Claude to read these four skills before every task. If a
// skill file loses its name, its description or its "Checklist before
// finishing", or CLAUDE.md stops pointing at it, Claude would quietly stop
// following that standard. This check turns that into a red CI run instead.
// Pure rules: the caller reads the files.

export const REQUIRED_SKILLS = ["accessibility", "performance", "security", "ux-design"] as const;

const MIN_DESCRIPTION_LENGTH = 40;
const MIN_CHECKLIST_ITEMS = 3;

export type SkillFiles = {
  /** Folder name under .claude/skills, mapped to that folder's SKILL.md text (or null if missing). */
  skills: Record<string, string | null>;
  /** The text of CLAUDE.md at the repository root. */
  claudeMd: string;
};

/** Returns every problem found. An empty list means the skills pass. */
export function checkSkills({ skills, claudeMd }: SkillFiles): string[] {
  const problems: string[] = [];

  for (const name of REQUIRED_SKILLS) {
    const text = skills[name];
    if (text === null || text === undefined) {
      problems.push(`${name}: .claude/skills/${name}/SKILL.md is missing`);
      continue;
    }

    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
    if (!frontmatter) {
      problems.push(`${name}: SKILL.md must start with a --- frontmatter block`);
    } else {
      const fields = frontmatter[1];
      const skillName = /^name:\s*(.+)$/m.exec(fields)?.[1].trim();
      const description = /^description:\s*(.+)$/m.exec(fields)?.[1].trim() ?? "";
      if (skillName !== name) {
        problems.push(`${name}: frontmatter name is "${skillName ?? ""}", expected "${name}"`);
      }
      if (description.length < MIN_DESCRIPTION_LENGTH) {
        problems.push(`${name}: frontmatter description is missing or too short to tell Claude when to use it`);
      }
    }

    const checklist = /^## Checklist before finishing\s*$([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(text);
    if (!checklist) {
      problems.push(`${name}: the "## Checklist before finishing" section is missing`);
    } else {
      const items = checklist[1].match(/^- \[ \] .+$/gm) ?? [];
      if (items.length < MIN_CHECKLIST_ITEMS) {
        problems.push(`${name}: the checklist has ${items.length} items, needs at least ${MIN_CHECKLIST_ITEMS}`);
      }
    }

    if (!claudeMd.includes(`.claude/skills/${name}/SKILL.md`)) {
      problems.push(`${name}: CLAUDE.md no longer points Claude at .claude/skills/${name}/SKILL.md`);
    }
  }

  return problems;
}
