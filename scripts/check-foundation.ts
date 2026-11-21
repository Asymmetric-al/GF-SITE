import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(import.meta.dirname, "..");

const errors: string[] = [];

const FRONTMATTER_REGEX = /^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---/u;
const FRONTMATTER_NAME_REGEX = /^name:\s*(?<name>.+)$/mu;

const FORBIDDEN_LOCK_ENTRY_REGEX =
  /^\s*"(?<pkg>(?:@radix-ui\/[^"]+|radix-ui|oxlint-tsgolint))"\s*:\s*\[/gmu;

const readText = (relativePath: string): string =>
  fs.readFileSync(path.join(repoRoot, relativePath), "utf-8");

const listSkillDirs = (relativeRoot: string): string[] => {
  const entries = fs.readdirSync(path.join(repoRoot, relativeRoot), {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      errors.push(
        `Symlink "${relativeRoot}/${entry.name}" breaks cross-platform Windows checkouts; copy real files instead.`
      );
    }
  }

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted();
};

const readFrontmatterName = (filePath: string): string | null => {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = FRONTMATTER_REGEX.exec(content);
  const frontmatter = match?.groups?.frontmatter;

  if (frontmatter === undefined || frontmatter.length === 0) {
    return null;
  }

  const nameMatch = FRONTMATTER_NAME_REGEX.exec(frontmatter);
  const rawName = nameMatch?.groups?.name;

  if (rawName === undefined || rawName.length === 0) {
    return null;
  }

  return rawName.trim().replaceAll(/^["']|["']$/gu, "");
};

interface ToolkitManifestItem {
  readonly id: string;
}

interface ToolkitManifest {
  readonly items: readonly ToolkitManifestItem[];
  readonly summary: {
    readonly projectSkills: number;
    readonly totalEntries: number;
  };
}

const isToolkitManifestItem = (value: unknown): value is ToolkitManifestItem =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "string" &&
  value.id.length > 0;

const isToolkitManifest = (value: unknown): value is ToolkitManifest => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("items" in value) || !Array.isArray(value.items)) {
    return false;
  }

  if (
    !("summary" in value) ||
    typeof value.summary !== "object" ||
    value.summary === null
  ) {
    return false;
  }

  const { summary } = value;

  return (
    "projectSkills" in summary &&
    typeof summary.projectSkills === "number" &&
    "totalEntries" in summary &&
    typeof summary.totalEntries === "number" &&
    value.items.every(isToolkitManifestItem)
  );
};

const checkForbiddenPackages = (): void => {
  const pkgText = readText("package.json");
  const lockText = readText("bun.lock");

  for (const forbidden of [
    "radix-ui",
    "@radix-ui/",
    "oxlint-tsgolint",
  ] as const) {
    if (pkgText.includes(forbidden)) {
      errors.push(`Forbidden package "${forbidden}" found in package.json.`);
    }
  }

  for (const match of lockText.matchAll(FORBIDDEN_LOCK_ENTRY_REGEX)) {
    const pkgName = match.groups?.pkg ?? "unknown";

    errors.push(`Forbidden resolved package "${pkgName}" found in bun.lock.`);
  }

  for (const forbiddenDir of [
    "node_modules/radix-ui",
    "node_modules/@radix-ui",
    "node_modules/oxlint-tsgolint",
  ] as const) {
    if (fs.existsSync(path.join(repoRoot, forbiddenDir))) {
      errors.push(`Forbidden package directory "${forbiddenDir}" exists.`);
    }
  }
};

const checkManagedBlocksAndLayers = (): void => {
  const agentsMd = readText("AGENTS.md");

  if (
    !agentsMd.includes("<!-- BEGIN:nextjs-agent-rules -->") ||
    !agentsMd.includes("<!-- END:nextjs-agent-rules -->")
  ) {
    errors.push(
      "AGENTS.md is missing the managed Next.js agent rules comment markers."
    );
  }

  const firstCssLine = readText("src/app/globals.css")
    .split(/\r?\n/u)[0]
    ?.trim();

  if (firstCssLine !== "@layer ui-sdk;") {
    errors.push(
      `src/app/globals.css line 1 must be "@layer ui-sdk;" (found "${firstCssLine ?? ""}").`
    );
  }
};

const collectInstalledSkillIds = (
  agentsSkills: readonly string[],
  claudeSkills: readonly string[]
): Set<string> => {
  if (agentsSkills.includes("nia") || claudeSkills.includes("nia")) {
    errors.push("Removed Nia skill still exists under .agents or .claude.");
  }

  if (/"Nia"\s*:/iu.test(readText("skills-lock.json"))) {
    errors.push('Removed "Nia" entry still exists in skills-lock.json.');
  }

  const agentsSet = new Set(agentsSkills);
  const claudeSet = new Set(claudeSkills);

  for (const skill of agentsSkills) {
    if (!claudeSet.has(skill)) {
      errors.push(`.agents/skills/${skill} is missing in .claude/skills/.`);
    }
  }

  for (const skill of claudeSkills) {
    if (!agentsSet.has(skill)) {
      errors.push(`.claude/skills/${skill} is missing in .agents/skills/.`);
    }
  }

  const expectedSkillIds = new Set<string>();

  for (const skill of agentsSkills) {
    const skillMd = path.join(repoRoot, ".agents", "skills", skill, "SKILL.md");

    if (!fs.existsSync(skillMd)) {
      errors.push(`Missing SKILL.md in .agents/skills/${skill}.`);
      continue;
    }

    const name = readFrontmatterName(skillMd);

    if (name === null || name.length === 0) {
      errors.push(`Missing frontmatter name in .agents/skills/${skill}.`);
      continue;
    }

    expectedSkillIds.add(`skill:${name}`);
  }

  return expectedSkillIds;
};

const checkManifestIntegrity = (
  expectedSkillIds: ReadonlySet<string>,
  installedSkillCount: number
): void => {
  const rawManifest: unknown = JSON.parse(
    readText("agent-toolkit-manifest.json")
  );

  if (!isToolkitManifest(rawManifest)) {
    errors.push(
      "agent-toolkit-manifest.json is missing valid items or summary fields."
    );

    return;
  }

  const seenIds = new Set<string>();
  const manifestSkillIds = new Set<string>();

  for (const item of rawManifest.items) {
    if (seenIds.has(item.id)) {
      errors.push(`Duplicate id "${item.id}" in agent-toolkit-manifest.json.`);
    }

    seenIds.add(item.id);

    if (item.id.startsWith("skill:")) {
      manifestSkillIds.add(item.id);
    }
  }

  for (const expectedId of expectedSkillIds) {
    if (!manifestSkillIds.has(expectedId)) {
      errors.push(
        `Installed skill "${expectedId}" is missing from agent-toolkit-manifest.json.`
      );
    }
  }

  for (const manifestId of manifestSkillIds) {
    if (!expectedSkillIds.has(manifestId)) {
      errors.push(
        `Manifest skill "${manifestId}" is not installed in .agents/skills/.`
      );
    }
  }

  if (rawManifest.summary.projectSkills !== installedSkillCount) {
    errors.push(
      `Manifest summary.projectSkills (${String(rawManifest.summary.projectSkills)}) does not match installed count (${String(installedSkillCount)}).`
    );
  }

  if (rawManifest.summary.totalEntries !== rawManifest.items.length) {
    errors.push(
      `Manifest summary.totalEntries (${String(rawManifest.summary.totalEntries)}) does not match items.length (${String(rawManifest.items.length)}).`
    );
  }
};

checkForbiddenPackages();

checkManagedBlocksAndLayers();

const agentsSkills = listSkillDirs(".agents/skills");
const claudeSkills = listSkillDirs(".claude/skills");
const expectedSkillIds = collectInstalledSkillIds(agentsSkills, claudeSkills);

checkManifestIntegrity(expectedSkillIds, agentsSkills.length);

if (errors.length > 0) {
  for (const message of errors) {
    process.stderr.write(`FAIL: ${message}\n`);
  }

  process.exit(1);
}

process.stdout.write(
  `Foundation invariants verified (${String(agentsSkills.length)} synced skills, zero Radix, zero oxlint-tsgolint, zero Nia).\n`
);
