import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  findForbiddenLockfileEntries,
  findForbiddenNodeModules,
  findForbiddenPackageManifestRefs,
  findPrivateDisclosures,
  readSkillFrontmatterName,
} from "./foundation-invariants";

const repoRoot = path.resolve(import.meta.dirname, "..");

const errors: string[] = [];

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

interface ToolkitManifestItem {
  readonly id: string;
}

interface ToolkitManifest {
  readonly items: readonly ToolkitManifestItem[];
  readonly summary: {
    readonly nonSkillEntries: number;
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
    "nonSkillEntries" in summary &&
    typeof summary.nonSkillEntries === "number" &&
    "projectSkills" in summary &&
    typeof summary.projectSkills === "number" &&
    "totalEntries" in summary &&
    typeof summary.totalEntries === "number" &&
    value.items.every(isToolkitManifestItem)
  );
};

const checkForbiddenPackages = (): void => {
  for (const forbidden of findForbiddenPackageManifestRefs(
    readText("package.json")
  )) {
    errors.push(`Forbidden package "${forbidden}" found in package.json.`);
  }

  for (const entry of findForbiddenLockfileEntries(readText("bun.lock"))) {
    errors.push(`Forbidden resolved package "${entry}" found in bun.lock.`);
  }

  for (const dirPath of findForbiddenNodeModules(
    path.join(repoRoot, "node_modules")
  )) {
    errors.push(
      `Forbidden package directory "${path.relative(repoRoot, dirPath)}" exists.`
    );
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

const checkNoNiaInConfigs = (
  agentsSkills: readonly string[],
  claudeSkills: readonly string[]
): void => {
  if (
    agentsSkills.some((name) => name.toLowerCase() === "nia") ||
    claudeSkills.some((name) => name.toLowerCase() === "nia")
  ) {
    errors.push("Removed Nia skill still exists under .agents or .claude.");
  }

  if (/"Nia"\s*:/iu.test(readText("skills-lock.json"))) {
    errors.push('Removed "Nia" entry still exists in skills-lock.json.');
  }

  for (const configPath of [
    ".mcp.json",
    ".cursor/mcp.json",
    ".codex/config.toml",
    ".agents/plugins/gf-site-ui-registries/mcp_config.json",
    ".agents/plugins/next-devtools/mcp_config.json",
  ] as const) {
    if (/\bnia\b/iu.test(readText(configPath))) {
      errors.push(`Removed Nia server reference found in ${configPath}.`);
    }
  }
};

const collectInstalledSkillIds = (
  agentsSkills: readonly string[],
  claudeSkills: readonly string[]
): Set<string> => {
  checkNoNiaInConfigs(agentsSkills, claudeSkills);

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
    const agentsSkillMd = path.join(
      repoRoot,
      ".agents",
      "skills",
      skill,
      "SKILL.md"
    );

    const claudeSkillMd = path.join(
      repoRoot,
      ".claude",
      "skills",
      skill,
      "SKILL.md"
    );

    const agentsName = readSkillFrontmatterName(agentsSkillMd);
    const claudeName = readSkillFrontmatterName(claudeSkillMd);

    if (agentsName === null || agentsName.length === 0) {
      errors.push(
        `Missing SKILL.md frontmatter name in .agents/skills/${skill}.`
      );
      continue;
    }

    if (claudeName === null || claudeName.length === 0) {
      errors.push(
        `Missing SKILL.md frontmatter name in .claude/skills/${skill}.`
      );
      continue;
    }

    if (agentsName !== claudeName) {
      errors.push(
        `Skill frontmatter name mismatch for "${skill}": .agents="${agentsName}" vs .claude="${claudeName}".`
      );
    }

    expectedSkillIds.add(`skill:${agentsName}`);
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

  const expectedNonSkillCount = rawManifest.items.length - installedSkillCount;

  if (rawManifest.summary.nonSkillEntries !== expectedNonSkillCount) {
    errors.push(
      `Manifest summary.nonSkillEntries (${String(rawManifest.summary.nonSkillEntries)}) does not match expected count (${String(expectedNonSkillCount)}).`
    );
  }

  if (rawManifest.summary.totalEntries !== rawManifest.items.length) {
    errors.push(
      `Manifest summary.totalEntries (${String(rawManifest.summary.totalEntries)}) does not match items.length (${String(rawManifest.items.length)}).`
    );
  }
};

const collectMarkdownFilesRecursive = (relativeDir: string): string[] => {
  const fullDir = path.join(repoRoot, relativeDir);

  if (!fs.existsSync(fullDir)) {
    return [];
  }

  const results: string[] = [];

  const walk = (directory: string): void => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(
          path.relative(repoRoot, fullPath).split(path.sep).join("/")
        );
      }
    }
  };

  walk(fullDir);

  return results.toSorted();
};

const checkPublicRepoPrivacy = (): void => {
  const publicFiles = [
    "README.md",
    "AGENTS.md",
    "CLAUDE.md",
    "DESIGN.md",
    ".agents/product-marketing.md",
    "agent-toolkit-manifest.json",
    ...collectMarkdownFilesRecursive("docs"),
    ...collectMarkdownFilesRecursive("knowledge"),
    ...collectMarkdownFilesRecursive("brand-kit"),
  ];

  for (const filePath of publicFiles) {
    for (const disclosure of findPrivateDisclosures(readText(filePath))) {
      errors.push(`Public file ${filePath} contains disallowed ${disclosure}.`);
    }
  }
};

checkForbiddenPackages();

checkManagedBlocksAndLayers();

const agentsSkills = listSkillDirs(".agents/skills");
const claudeSkills = listSkillDirs(".claude/skills");
const expectedSkillIds = collectInstalledSkillIds(agentsSkills, claudeSkills);

checkManifestIntegrity(expectedSkillIds, agentsSkills.length);

checkPublicRepoPrivacy();

if (errors.length > 0) {
  for (const message of errors) {
    process.stderr.write(`FAIL: ${message}\n`);
  }

  process.exit(1);
}

process.stdout.write(
  `Foundation invariants verified (${String(agentsSkills.length)} synced skills, zero Radix, zero oxlint-tsgolint, zero Nia, public docs sanitized).\n`
);
