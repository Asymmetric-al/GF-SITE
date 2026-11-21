import fs from "node:fs";
import path from "node:path";

const FORBIDDEN_PACKAGES = [
  "radix-ui",
  "@radix-ui/",
  "oxlint-tsgolint",
] as const;

const LOCK_KEY_AND_TUPLE_REGEX =
  /^\s*"(?<key>[^"]+)"\s*:\s*\[\s*"(?<resolved>[^"]+)"/gmu;

const FRONTMATTER_REGEX = /^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---/u;
const FRONTMATTER_NAME_REGEX = /^name:\s*(?<name>.+)$/mu;

const PRIVATE_DISCLOSURE_PATTERNS = [
  { label: "Windows user profile path", pattern: /C:[\\/]+Users[\\/]+/iu },
  { label: "macOS user home path", pattern: /\/Users\/[a-z0-9._-]+\//iu },
  { label: "personal GitHub handle", pattern: /\bcobmojo\b/iu },
  { label: "personal Vercel handle", pattern: /\bconrad-4371\b/iu },
  { label: "Cloudinary cloud identifier", pattern: /\bdvgyndcnu\b/iu },
] as const;

const isForbiddenPackageSegment = (segment: string): boolean =>
  segment === "radix-ui" ||
  segment === "oxlint-tsgolint" ||
  segment.startsWith("@radix-ui/");

const extractPackageNameFromResolved = (resolved: string): string => {
  const separatorIndex = resolved.startsWith("@")
    ? resolved.indexOf("@", 1)
    : resolved.indexOf("@");

  return separatorIndex > 0 ? resolved.slice(0, separatorIndex) : resolved;
};

const keyContainsForbiddenPackage = (key: string): boolean => {
  if (isForbiddenPackageSegment(key)) {
    return true;
  }

  const parts = key.split("/");

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];

    if (part === "radix-ui" || part === "oxlint-tsgolint") {
      return true;
    }

    if (part === "@radix-ui" && index + 1 < parts.length) {
      return true;
    }
  }

  return false;
};

export const findForbiddenLockfileEntries = (lockText: string): string[] => {
  const matches: string[] = [];

  for (const match of lockText.matchAll(LOCK_KEY_AND_TUPLE_REGEX)) {
    const key = match.groups?.key ?? "";
    const resolved = match.groups?.resolved ?? "";
    const resolvedName = extractPackageNameFromResolved(resolved);

    if (
      keyContainsForbiddenPackage(key) ||
      isForbiddenPackageSegment(resolvedName)
    ) {
      matches.push(`${key} -> ${resolved}`);
    }
  }

  return matches;
};

export const findForbiddenPackageManifestRefs = (pkgText: string): string[] => {
  const hits: string[] = [];

  for (const forbidden of FORBIDDEN_PACKAGES) {
    if (pkgText.includes(forbidden)) {
      hits.push(forbidden);
    }
  }

  return hits;
};

export const findForbiddenNodeModules = (rootNodeModules: string): string[] => {
  if (!fs.existsSync(rootNodeModules)) {
    return [];
  }

  const hits: string[] = [];
  const queue: string[] = [rootNodeModules];

  while (queue.length > 0) {
    const currentDir = queue.pop();

    if (currentDir === undefined) {
      continue;
    }

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);

      if (
        entry.name === "radix-ui" ||
        entry.name === "@radix-ui" ||
        entry.name === "oxlint-tsgolint"
      ) {
        hits.push(fullPath);
        continue;
      }

      if (entry.name.startsWith("@")) {
        const scopedEntries = fs.readdirSync(fullPath, { withFileTypes: true });

        for (const scopedEntry of scopedEntries) {
          if (!scopedEntry.isDirectory()) {
            continue;
          }

          const nestedNodeModules = path.join(
            fullPath,
            scopedEntry.name,
            "node_modules"
          );

          if (fs.existsSync(nestedNodeModules)) {
            queue.push(nestedNodeModules);
          }
        }

        continue;
      }

      const nestedNodeModules = path.join(fullPath, "node_modules");

      if (fs.existsSync(nestedNodeModules)) {
        queue.push(nestedNodeModules);
      }
    }
  }

  return hits;
};

export const readSkillFrontmatterName = (filePath: string): string | null => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

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

export const findPrivateDisclosures = (text: string): string[] => {
  const hits: string[] = [];

  for (const { label, pattern } of PRIVATE_DISCLOSURE_PATTERNS) {
    if (pattern.test(text)) {
      hits.push(label);
    }
  }

  return hits;
};
