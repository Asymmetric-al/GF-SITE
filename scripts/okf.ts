import fs from "node:fs";
import path from "node:path";

import type { Node } from "yaml";
import { isMap, isNode, isPair, isScalar, isSeq, parseDocument } from "yaml";

export type OkfFindingLevel = "error" | "info" | "warning";

export interface OkfFinding {
  readonly code: string;
  readonly level: OkfFindingLevel;
  readonly line: number | null;
  readonly message: string;
  readonly path: string;
}

export interface OkfValidationReport {
  readonly bundle: string;
  readonly errors: number;
  readonly filesChecked: number;
  readonly findings: readonly OkfFinding[];
  readonly info: number;
  readonly okfVersion: string | null;
  readonly warnings: number;
}

export type OkfTrustTier =
  | "human-reviewed"
  | "machine-confirmed"
  | "unverified";

export interface OkfConceptSummary {
  readonly current: boolean;
  readonly description: string | null;
  readonly generatedAt: string | null;
  readonly id: string;
  readonly notes: readonly string[];
  readonly path: string;
  readonly replacementId: string | null;
  readonly resource: string | null;
  readonly runtime: string | null;
  readonly stale: boolean;
  readonly staleAfter: string | null;
  readonly status: string;
  readonly supersededBy: string | null;
  readonly tags: readonly string[];
  readonly title: string;
  readonly trust: OkfTrustTier;
  readonly type: string;
  readonly verifiedBeforeChange: boolean;
}

export interface OkfNonConceptEntry {
  readonly path: string;
  readonly reason: string;
}

export interface OkfScanOptions {
  readonly currentOnly?: boolean;
  readonly deprecatedOnly?: boolean;
  readonly grep?: string;
  readonly now?: Date;
  readonly staleOnly?: boolean;
  readonly tag?: string;
  readonly type?: string;
  readonly unverifiedOnly?: boolean;
}

export interface OkfScanReport {
  readonly bundle: {
    readonly description: string | null;
    readonly license: string | null;
    readonly path: string;
    readonly title: string | null;
  };
  readonly concepts: readonly OkfConceptSummary[];
  readonly notConcepts: readonly OkfNonConceptEntry[];
  readonly now: string;
  readonly okfVersion: string | null;
  readonly summary: {
    readonly concepts: number;
    readonly deprecated: number;
    readonly draft: number;
    readonly notConcepts: number;
    readonly notCurrent: number;
    readonly selected: number;
    readonly stale: number;
    readonly trust: Readonly<Record<OkfTrustTier, number>>;
    readonly types: readonly {
      readonly count: number;
      readonly type: string;
    }[];
  };
}

type OkfYamlValue =
  | { readonly kind: "absent" }
  | { readonly kind: "boolean"; readonly value: boolean }
  | {
      readonly entries: ReadonlyMap<string, OkfYamlValue>;
      readonly kind: "map";
    }
  | { readonly kind: "null" }
  | { readonly kind: "number"; readonly value: number }
  | { readonly kind: "other"; readonly raw: string }
  | { readonly items: readonly OkfYamlValue[]; readonly kind: "seq" }
  | { readonly kind: "string"; readonly value: string };

type OkfYamlMap = Extract<OkfYamlValue, { readonly kind: "map" }>;

interface OkfRootMetadata {
  readonly description: string | null;
  readonly license: string | null;
  readonly okfVersion: string | null;
  readonly title: string | null;
}

interface CheckedTimestamp {
  readonly date: Date | null;
  readonly raw: string | null;
}

interface ResolvedPathResult {
  readonly kind: "external" | "fallback" | "found" | "missing";
  readonly resolvedPath: string | null;
}

interface TrustSummaryState {
  readonly generatedAtText: string | null;
  readonly notes: readonly string[];
  readonly trust: OkfTrustTier;
  readonly verifiedBeforeChange: boolean;
}

interface FreshnessSummaryState {
  readonly notes: readonly string[];
  readonly stale: boolean;
  readonly staleAfter: string | null;
}

const VALID_STATUSES = new Set(["draft", "stable", "deprecated"]);
const CURRENT_STATUSES = new Set(["draft", "stable"]);

const DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}[Tt]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[Zz]|[+-]\d{2}:\d{2})$/u;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/u;
const ACTOR_REGEX = /^(?:[^\s/:]+\/\S+|[A-Za-z][A-Za-z0-9+.-]*:\S+)$/u;

const SPDX_REGEX = /^[A-Za-z0-9.+-]+(?: (?:AND|OR|WITH) [A-Za-z0-9.+-]+)*$/u;

const LINK_REGEX =
  /(?<!!)\[[^\]]*\]\(\s*<?(?<target>[^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/gu;

const FOOTNOTE_REGEX = /\[\^(?<label>[^\]\s]+)\]/gu;
const INLINE_CODE_REGEX = /`[^`]*`/gu;
const HEADING_REGEX = /^(?<hashes>#{1,6})\s+(?<text>.*?)\s*#*\s*$/u;
const SCHEME_REGEX = /^[A-Za-z][A-Za-z0-9+.-]*:/u;
const WHITESPACE_REGEX = /\s/u;

const KNOWN_CONCEPT_KEYS = new Set([
  "type",
  "title",
  "description",
  "resource",
  "tags",
  "sources",
  "usage_window",
  "generated",
  "verified",
  "status",
  "superseded_by",
  "stale_after",
  "runtime",
  "parameters",
  "computation",
  "executor",
  "attester",
  "timestamp",
]);

const ABSENT_VALUE: OkfYamlValue = { kind: "absent" };

type FrontmatterParseResult =
  | {
      readonly body: string;
      readonly bodyLine: number;
      readonly kind: "absent";
    }
  | {
      readonly body: string;
      readonly bodyLine: number;
      readonly code: "E002" | "E007";
      readonly kind: "error";
      readonly line: number;
      readonly message: string;
    }
  | {
      readonly body: string;
      readonly bodyLine: number;
      readonly kind: "ok";
      readonly map: OkfYamlMap;
      readonly warnings: readonly {
        readonly line: number;
        readonly message: string;
      }[];
    };

const isStringPrimitive = (value: unknown): value is string =>
  typeof value === "string";

const isNumberPrimitive = (value: unknown): value is number =>
  typeof value === "number";

const isBooleanPrimitive = (value: unknown): value is boolean =>
  typeof value === "boolean";

const convertYamlAst = (node: Node | null): OkfYamlValue => {
  if (node === null) {
    return { kind: "null" };
  }

  if (isScalar(node)) {
    const raw = node.value;

    if (raw === null || raw === undefined) {
      return { kind: "null" };
    }

    if (isStringPrimitive(raw)) {
      return { kind: "string", value: raw };
    }

    if (isNumberPrimitive(raw)) {
      return { kind: "number", value: raw };
    }

    if (isBooleanPrimitive(raw)) {
      return { kind: "boolean", value: raw };
    }

    return { kind: "other", raw: JSON.stringify(raw) ?? "unknown" };
  }

  if (isSeq(node)) {
    return {
      items: node.items.map((item) =>
        isNode(item) ? convertYamlAst(item) : { kind: "null" }
      ),
      kind: "seq",
    };
  }

  if (isMap(node)) {
    const entries = new Map<string, OkfYamlValue>();

    for (const pair of node.items) {
      if (!isPair(pair)) {
        continue;
      }

      const keyValue = isNode(pair.key)
        ? convertYamlAst(pair.key)
        : { kind: "null" as const };

      const keyName = formatYamlScalarText(keyValue);

      if (keyName !== null) {
        entries.set(
          keyName,
          isNode(pair.value) ? convertYamlAst(pair.value) : { kind: "null" }
        );
      }
    }

    return { entries, kind: "map" };
  }

  return { kind: "other", raw: "unknown" };
};

const formatYamlScalarText = (value: OkfYamlValue): string | null => {
  if (value.kind === "string") {
    return value.value;
  }

  if (value.kind === "number") {
    return String(value.value);
  }

  if (value.kind === "boolean") {
    return String(value.value);
  }

  if (value.kind === "other") {
    return value.raw;
  }

  return null;
};

const describeYamlValue = (value: OkfYamlValue): string => {
  if (value.kind === "string") {
    return JSON.stringify(value.value);
  }

  if (value.kind === "number") {
    return String(value.value);
  }

  if (value.kind === "boolean") {
    return String(value.value);
  }

  if (value.kind === "null" || value.kind === "absent") {
    return "null";
  }

  if (value.kind === "seq") {
    return "[list]";
  }

  if (value.kind === "map") {
    return "{mapping}";
  }

  return value.raw;
};

const getField = (map: OkfYamlMap, key: string): OkfYamlValue =>
  map.entries.get(key) ?? ABSENT_VALUE;

const isBlankValue = (value: OkfYamlValue): boolean => {
  if (value.kind === "absent" || value.kind === "null") {
    return true;
  }

  if (value.kind === "string") {
    return value.value === "";
  }

  if (value.kind === "seq") {
    return value.items.length === 0;
  }

  return false;
};

const asValueList = (value: OkfYamlValue): readonly OkfYamlValue[] => {
  if (isBlankValue(value)) {
    return [];
  }

  if (value.kind === "seq") {
    return value.items;
  }

  return [value];
};

const getOptionalString = (map: OkfYamlMap, key: string): string | null => {
  const value = getField(map, key);

  if (value.kind === "string" && value.value.length > 0) {
    return value.value;
  }

  return null;
};

const stripBom = (text: string): string =>
  text.startsWith("\uFEFF") ? text.slice(1) : text;

const toPosixRelative = (bundleRoot: string, targetPath: string): string => {
  if (targetPath === bundleRoot) {
    return ".";
  }

  return path.relative(bundleRoot, targetPath).split(path.sep).join("/");
};

const isInsideBundle = (bundleRoot: string, candidatePath: string): boolean => {
  const relative = path.relative(bundleRoot, candidatePath);

  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
};

const startsWithFrontmatter = (text: string): boolean => {
  const [firstLine] = stripBom(text).split(/\r?\n/u);

  return firstLine === "---";
};

const splitFrontmatter = (rawText: string): FrontmatterParseResult => {
  const text = stripBom(rawText);
  const lines = text.split(/\r?\n/u);

  if (lines.length === 0 || lines[0] !== "---") {
    return { body: text, bodyLine: 1, kind: "absent" };
  }

  let closingIndex = -1;

  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] === "---") {
      closingIndex = index;
      break;
    }
  }

  if (closingIndex === -1) {
    return {
      body: "",
      bodyLine: lines.length + 1,
      code: "E002",
      kind: "error",
      line: 1,
      message:
        "frontmatter does not parse as a YAML mapping: the closing --- line is missing (section 4)",
    };
  }

  const block = lines.slice(1, closingIndex).join("\n");
  const body = lines.slice(closingIndex + 1).join("\n");
  const bodyLine = closingIndex + 2;

  const doc = parseDocument(block, {
    schema: "core",
    strict: true,
    uniqueKeys: true,
  });

  const [firstError] = doc.errors;

  if (firstError !== undefined) {
    const line = (firstError.linePos?.[0]?.line ?? 0) + 1;
    const summaryLine = firstError.message.split("\n")[0] ?? "invalid YAML";

    if (firstError.code === "DUPLICATE_KEY") {
      return {
        body,
        bodyLine,
        code: "E007",
        kind: "error",
        line,
        message: `frontmatter repeats a key; keys must be unique (section 4): ${summaryLine}`,
      };
    }

    return {
      body,
      bodyLine,
      code: "E002",
      kind: "error",
      line,
      message: `frontmatter does not parse as a YAML mapping: ${summaryLine} (section 4)`,
    };
  }

  const warnings = doc.warnings.map((warning) => ({
    line: (warning.linePos?.[0]?.line ?? 0) + 1,
    message: warning.message.split("\n")[0] ?? "YAML warning",
  }));

  if (doc.contents === null) {
    return {
      body,
      bodyLine,
      kind: "ok",
      map: { entries: new Map(), kind: "map" },
      warnings,
    };
  }

  const converted = convertYamlAst(doc.contents);

  if (converted.kind !== "map") {
    return {
      body,
      bodyLine,
      code: "E002",
      kind: "error",
      line: 1,
      message:
        "frontmatter does not parse as a YAML mapping: frontmatter is not a YAML mapping (section 4)",
    };
  }

  return { body, bodyLine, kind: "ok", map: converted, warnings };
};

export const parseOkfTimestamp = (value: string): Date | null => {
  if (DATE_REGEX.test(value)) {
    const parsed = new Date(`${value}T00:00:00.000Z`);

    return Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== value
      ? null
      : parsed;
  }

  if (!DATETIME_REGEX.test(value)) {
    return null;
  }

  const datePart = value.slice(0, 10);
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const [yearText, monthText, dayText] = datePart.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const calendarProbe = new Date(Date.UTC(year, month - 1, day));

  if (
    calendarProbe.getUTCFullYear() !== year ||
    calendarProbe.getUTCMonth() + 1 !== month ||
    calendarProbe.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const parseVersionTuple = (version: string): readonly number[] | null => {
  const parts = version.split(".");
  const numbers: number[] = [];

  for (const part of parts) {
    if (!/^\d+$/u.test(part)) {
      return null;
    }

    numbers.push(Number(part));
  }

  return numbers;
};

const usesV02RootFallback = (okfVersion: string | null): boolean => {
  if (okfVersion === null) {
    return true;
  }

  const tuple = parseVersionTuple(okfVersion);

  if (tuple === null || tuple.length === 0) {
    return false;
  }

  const major = tuple[0] ?? 0;
  const minor = tuple[1] ?? 0;

  return major === 0 && minor <= 2;
};

const collectMarkdownFiles = (bundleRoot: string): string[] => {
  const files: string[] = [];
  const resolvedRoot = fs.realpathSync(bundleRoot);

  const walk = (directory: string): void => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const fullPath = path.join(directory, entry.name);
      let resolvedPath: string;

      try {
        resolvedPath = fs.realpathSync(fullPath);
      } catch {
        continue;
      }

      if (!isInsideBundle(resolvedRoot, resolvedPath)) {
        continue;
      }

      const stats = fs.statSync(resolvedPath);

      if (stats.isDirectory()) {
        walk(fullPath);
      } else if (stats.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  };

  walk(bundleRoot);

  return files.toSorted((left, right) =>
    toPosixRelative(bundleRoot, left).localeCompare(
      toPosixRelative(bundleRoot, right)
    )
  );
};

const resolveBundlePath = (
  bundleRoot: string,
  sourceFile: string,
  target: string,
  allowRootFallback: boolean
): ResolvedPathResult => {
  if (SCHEME_REGEX.test(target) || target.startsWith("//")) {
    return { kind: "external", resolvedPath: null };
  }

  const withoutFragment = target.split("#", 1)[0] ?? "";
  const withoutQuery = withoutFragment.split("?", 1)[0] ?? "";
  let decoded = withoutQuery;

  try {
    decoded = decodeURIComponent(withoutQuery);
  } catch {
    decoded = withoutQuery;
  }

  if (decoded.length === 0) {
    return { kind: "found", resolvedPath: sourceFile };
  }

  const isRootRelative = decoded.startsWith("/");
  const baseDir = isRootRelative ? bundleRoot : path.dirname(sourceFile);
  const relativePart = isRootRelative ? decoded.replace(/^\/+/u, "") : decoded;
  const candidate = path.resolve(baseDir, relativePart);

  if (!isInsideBundle(bundleRoot, candidate)) {
    return { kind: "external", resolvedPath: null };
  }

  if (fs.existsSync(candidate)) {
    return { kind: "found", resolvedPath: candidate };
  }

  if (allowRootFallback && !isRootRelative) {
    const fallbackCandidate = path.resolve(bundleRoot, decoded);

    if (
      isInsideBundle(bundleRoot, fallbackCandidate) &&
      fs.existsSync(fallbackCandidate)
    ) {
      return { kind: "fallback", resolvedPath: fallbackCandidate };
    }
  }

  return { kind: "missing", resolvedPath: null };
};

const extractProseLines = (
  body: string
): readonly { readonly line: string; readonly offset: number }[] => {
  const lines = body.split(/\r?\n/u);
  const result: { readonly line: string; readonly offset: number }[] = [];
  let activeFence: string | null = null;

  for (let offset = 0; offset < lines.length; offset += 1) {
    const line = lines[offset] ?? "";
    const trimmedLeft = line.trimStart();

    if (
      activeFence === null &&
      (trimmedLeft.startsWith("```") || trimmedLeft.startsWith("~~~"))
    ) {
      activeFence = trimmedLeft.slice(0, 3);
      continue;
    }

    if (activeFence !== null) {
      if (trimmedLeft.startsWith(activeFence)) {
        activeFence = null;
      }

      continue;
    }

    if (line.startsWith("    ") || line.startsWith("\t")) {
      continue;
    }

    result.push({
      line: line.replaceAll(INLINE_CODE_REGEX, ""),
      offset,
    });
  }

  return result;
};

const countComputationFences = (body: string): number => {
  const lines = body.split(/\r?\n/u);
  let activeFence: string | null = null;
  let sectionLevel: number | null = null;
  let count = 0;

  for (const line of lines) {
    const trimmedLeft = line.trimStart();

    if (activeFence !== null) {
      if (trimmedLeft.startsWith(activeFence)) {
        activeFence = null;
      }

      continue;
    }

    if (trimmedLeft.startsWith("```") || trimmedLeft.startsWith("~~~")) {
      activeFence = trimmedLeft.slice(0, 3);

      if (sectionLevel !== null) {
        count += 1;
      }

      continue;
    }

    const headingMatch = HEADING_REGEX.exec(line);

    if (headingMatch?.groups !== undefined) {
      const depth = headingMatch.groups.hashes?.length ?? 0;
      const headingText = (headingMatch.groups.text ?? "").trim().toLowerCase();

      if (sectionLevel !== null && depth <= sectionLevel) {
        break;
      }

      if (sectionLevel === null && headingText === "computation") {
        sectionLevel = depth;
      }
    }
  }

  return count;
};

const EMPTY_ROOT_METADATA: OkfRootMetadata = {
  description: null,
  license: null,
  okfVersion: null,
  title: null,
};

const readRootMetadata = (bundleRoot: string): OkfRootMetadata => {
  const rootIndexPath = path.join(bundleRoot, "index.md");

  if (!fs.existsSync(rootIndexPath)) {
    return EMPTY_ROOT_METADATA;
  }

  const parsed = splitFrontmatter(fs.readFileSync(rootIndexPath, "utf-8"));

  if (parsed.kind !== "ok") {
    return EMPTY_ROOT_METADATA;
  }

  const versionText = formatYamlScalarText(getField(parsed.map, "okf_version"));

  return {
    description: getOptionalString(parsed.map, "description"),
    license: getOptionalString(parsed.map, "license"),
    okfVersion:
      versionText !== null && versionText.length > 0 ? versionText : null,
    title: getOptionalString(parsed.map, "title"),
  };
};

interface ValidationContext {
  readonly addFinding: (
    filePath: string,
    line: number | null,
    level: OkfFindingLevel,
    code: string,
    message: string
  ) => void;
  readonly bundleRoot: string;
  readonly now: Date;
  readonly rootFallback: boolean;
}

const checkActor = (
  ctx: ValidationContext,
  filePath: string,
  field: string,
  value: OkfYamlValue
): void => {
  if (value.kind !== "string" || !ACTOR_REGEX.test(value.value)) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W103",
      `${field} is an actor: <producer>/<version> or <scheme>:<id>, such as human:<id> (section 7); found ${describeYamlValue(value)}`
    );
  }
};

const checkTimestampValue = (
  ctx: ValidationContext,
  filePath: string,
  field: string,
  value: OkfYamlValue
): CheckedTimestamp => {
  if (value.kind !== "string") {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W101",
      `${field} is an RFC 3339 date-time with an offset, such as 2026-06-30T14:00:00Z, or a date such as 2026-06-30 (section 5); found ${describeYamlValue(value)}`
    );

    return { date: null, raw: null };
  }

  const parsed = parseOkfTimestamp(value.value);

  if (parsed === null) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W101",
      `${field} is an RFC 3339 date-time with an offset, such as 2026-06-30T14:00:00Z, or a date such as 2026-06-30 (section 5); found ${JSON.stringify(value.value)}`
    );

    return { date: null, raw: value.value };
  }

  return { date: parsed, raw: value.value };
};

const checkPathField = (
  ctx: ValidationContext,
  filePath: string,
  field: string,
  value: OkfYamlValue
): void => {
  if (value.kind !== "string") {
    return;
  }

  const resolved = resolveBundlePath(
    ctx.bundleRoot,
    filePath,
    value.value,
    ctx.rootFallback
  );

  if (resolved.kind === "missing") {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W116",
      `${field} ${JSON.stringify(value.value)} does not resolve to a file in the bundle (section 6.2)`
    );
  } else if (resolved.kind === "fallback") {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W119",
      `${field} ${JSON.stringify(value.value)} resolves only from the bundle root via v0.2 fallback; write it as /${value.value} (section 6.2)`
    );
  }
};

const checkWindowValue = (
  ctx: ValidationContext,
  filePath: string,
  field: string,
  value: OkfYamlValue
): void => {
  if (
    value.kind !== "map" ||
    isBlankValue(getField(value, "from")) ||
    isBlankValue(getField(value, "to"))
  ) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W101",
      `${field} is a { from, to } mapping of timestamps (section 5.1)`
    );

    return;
  }

  checkTimestampValue(ctx, filePath, `${field}.from`, getField(value, "from"));
  checkTimestampValue(ctx, filePath, `${field}.to`, getField(value, "to"));
};

const checkBodyLinks = (
  ctx: ValidationContext,
  filePath: string,
  body: string,
  bodyLine: number
): void => {
  for (const { line, offset } of extractProseLines(body)) {
    const lineNumber = bodyLine + offset;

    for (const match of line.matchAll(LINK_REGEX)) {
      const target = match.groups?.target ?? "";

      if (target.length === 0 || target.startsWith("#")) {
        continue;
      }

      const resolved = resolveBundlePath(
        ctx.bundleRoot,
        filePath,
        target,
        false
      );

      if (resolved.kind === "missing") {
        ctx.addFinding(
          filePath,
          lineNumber,
          "warning",
          "W115",
          `link target ${JSON.stringify(target)} is not in the bundle (section 6.1)`
        );
      }
    }
  }
};

const checkConceptBody = (
  ctx: ValidationContext,
  filePath: string,
  body: string,
  bodyLine: number,
  sourceIds: ReadonlySet<string>
): void => {
  const reportedFootnotes = new Set<string>();

  for (const { line, offset } of extractProseLines(body)) {
    const lineNumber = bodyLine + offset;

    for (const match of line.matchAll(FOOTNOTE_REGEX)) {
      const label = match.groups?.label ?? "";

      if (
        label.length > 0 &&
        !sourceIds.has(label) &&
        !reportedFootnotes.has(label)
      ) {
        reportedFootnotes.add(label);
        ctx.addFinding(
          filePath,
          lineNumber,
          "warning",
          "W108",
          `footnote [^${label}] has no sources entry with that id (section 5.1)`
        );
      }
    }
  }

  checkBodyLinks(ctx, filePath, body, bodyLine);
};

const checkIndexFile = (
  ctx: ValidationContext,
  filePath: string,
  text: string
): void => {
  if (path.dirname(filePath) !== ctx.bundleRoot) {
    if (startsWithFrontmatter(text)) {
      ctx.addFinding(
        filePath,
        1,
        "error",
        "E004",
        "an index.md below the bundle root has no frontmatter (section 8)"
      );

      return;
    }

    checkBodyLinks(ctx, filePath, stripBom(text), 1);

    return;
  }

  const parsed = splitFrontmatter(text);

  if (parsed.kind === "absent") {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W125",
      'give the root index.md frontmatter with okf_version: "0.3" (section 8.1)'
    );
    checkBodyLinks(ctx, filePath, parsed.body, parsed.bodyLine);

    return;
  }

  if (parsed.kind === "error") {
    ctx.addFinding(filePath, parsed.line, "error", parsed.code, parsed.message);

    return;
  }

  for (const warning of parsed.warnings) {
    ctx.addFinding(filePath, warning.line, "warning", "W127", warning.message);
  }

  const versionValue = getField(parsed.map, "okf_version");

  if (isBlankValue(versionValue)) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W125",
      'add okf_version: "0.3" to the root index.md (section 8.1)'
    );
  } else if (versionValue.kind !== "string") {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W117",
      `quote okf_version as a string, for example "0.3" (section 8.1); found ${describeYamlValue(versionValue)}`
    );
  }

  const licenseValue = getField(parsed.map, "license");

  if (
    licenseValue.kind === "string" &&
    licenseValue.value.length > 0 &&
    !SPDX_REGEX.test(licenseValue.value) &&
    resolveBundlePath(
      ctx.bundleRoot,
      filePath,
      licenseValue.value,
      ctx.rootFallback
    ).kind === "missing"
  ) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W116",
      `license ${JSON.stringify(licenseValue.value)} is not an SPDX expression or a file in the bundle (section 8.1)`
    );
  }

  checkBodyLinks(ctx, filePath, parsed.body, parsed.bodyLine);
};

const checkLogFile = (
  ctx: ValidationContext,
  filePath: string,
  text: string
): void => {
  const cleanText = stripBom(text);

  if (startsWithFrontmatter(cleanText)) {
    ctx.addFinding(
      filePath,
      1,
      "error",
      "E006",
      "log.md has no frontmatter (section 9)"
    );
  }

  const lines = cleanText.split(/\r?\n/u);
  const dates: { readonly date: string; readonly line: number }[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";

    if (line.startsWith("## ")) {
      const heading = line.slice(3).trim();

      if (DATE_REGEX.test(heading)) {
        dates.push({ date: heading, line: index + 1 });
      } else {
        ctx.addFinding(
          filePath,
          index + 1,
          "error",
          "E005",
          `a log.md date heading must be YYYY-MM-DD (section 9); found ${JSON.stringify(heading)}`
        );
      }
    }
  }

  for (let index = 1; index < dates.length; index += 1) {
    const newer = dates[index - 1];
    const older = dates[index];

    if (newer !== undefined && older !== undefined && older.date > newer.date) {
      ctx.addFinding(
        filePath,
        older.line,
        "warning",
        "W118",
        `log.md puts the newest date first (section 9); ${older.date} follows ${newer.date}`
      );
    }
  }

  checkBodyLinks(ctx, filePath, cleanText, 1);
};

const checkConceptSources = (
  ctx: ValidationContext,
  filePath: string,
  map: OkfYamlMap
): Set<string> => {
  const ids = new Set<string>();
  const sharedWindow = getField(map, "usage_window");

  if (!isBlankValue(sharedWindow)) {
    checkWindowValue(ctx, filePath, "usage_window", sharedWindow);
  }

  const sources = asValueList(getField(map, "sources"));

  for (let index = 0; index < sources.length; index += 1) {
    const entry = sources[index];
    const field = `sources[${String(index)}]`;

    if (
      entry === undefined ||
      entry.kind !== "map" ||
      isBlankValue(getField(entry, "resource"))
    ) {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W106",
        `${field} needs a resource; consumers ignore it (section 5.1)`
      );
      continue;
    }

    const idText = formatYamlScalarText(getField(entry, "id"));

    if (idText !== null && idText.length > 0) {
      if (ids.has(idText)) {
        ctx.addFinding(
          filePath,
          1,
          "warning",
          "W107",
          `${field}.id ${JSON.stringify(idText)} is not unique (section 5.1)`
        );
      }

      ids.add(idText);
    }

    const authorValue = getField(entry, "author");

    if (!isBlankValue(authorValue)) {
      checkActor(ctx, filePath, `${field}.author`, authorValue);
    }

    const lastModifiedValue = getField(entry, "last_modified");

    if (!isBlankValue(lastModifiedValue)) {
      checkTimestampValue(
        ctx,
        filePath,
        `${field}.last_modified`,
        lastModifiedValue
      );
    }

    const entryWindow = getField(entry, "usage_window");

    if (!isBlankValue(entryWindow)) {
      checkWindowValue(ctx, filePath, `${field}.usage_window`, entryWindow);
    }

    if (
      !isBlankValue(getField(entry, "usage_count")) &&
      isBlankValue(sharedWindow) &&
      isBlankValue(entryWindow)
    ) {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W109",
        `${field}.usage_count needs a usage_window that gives its period (section 5.1)`
      );
    }

    const resourceValue = getField(entry, "resource");

    if (
      resourceValue.kind === "string" &&
      !WHITESPACE_REGEX.test(resourceValue.value)
    ) {
      checkPathField(ctx, filePath, `${field}.resource`, resourceValue);
    }
  }

  return ids;
};

const checkAttestedComputation = (
  ctx: ValidationContext,
  filePath: string,
  map: OkfYamlMap,
  body: string
): void => {
  if (isBlankValue(getField(map, "runtime"))) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W111",
      "an Attested Computation needs runtime (section 10.2)"
    );
  }

  const computationValue = getField(map, "computation");
  const fenceCount = countComputationFences(body);

  if (!isBlankValue(computationValue)) {
    checkPathField(ctx, filePath, "computation", computationValue);

    if (fenceCount > 0) {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W112",
        "with a computation field, do not also put a fenced block in the Computation section (section 10.3)"
      );
    }
  } else if (fenceCount === 0) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W112",
      "no computation: no computation field and no fenced block in a Computation section, so the concept is not attestable (section 10.3)"
    );
  } else if (fenceCount > 1) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W126",
      `put exactly one fenced block in the Computation section; consumers use the first of ${String(fenceCount)} (section 10.3)`
    );
  }

  const parameters = asValueList(getField(map, "parameters"));

  for (let index = 0; index < parameters.length; index += 1) {
    const param = parameters[index];

    if (
      param === undefined ||
      param.kind !== "map" ||
      isBlankValue(getField(param, "name")) ||
      isBlankValue(getField(param, "type"))
    ) {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W113",
        `parameters[${String(index)}] needs name and type (section 10.2)`
      );
    }
  }

  for (const key of ["executor", "attester"] as const) {
    const value = getField(map, key);

    if (isBlankValue(value)) {
      continue;
    }

    if (value.kind !== "map" || isBlankValue(getField(value, "resource"))) {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W114",
        `${key} is a mapping with a resource field (section 10.2)`
      );
      continue;
    }

    if (key === "executor" && getField(value, "receipt").kind !== "seq") {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W114",
        "executor.receipt lists the fields that a run returns (section 10.2)"
      );
    }

    checkPathField(
      ctx,
      filePath,
      `${key}.resource`,
      getField(value, "resource")
    );
  }

  if (isBlankValue(getField(map, "attester"))) {
    ctx.addFinding(
      filePath,
      1,
      "info",
      "I205",
      "without an attester, consumers cannot show values from this computation as attested (section 10.2)"
    );
  }
};

const checkConceptCoreFields = (
  ctx: ValidationContext,
  filePath: string,
  map: OkfYamlMap
): void => {
  for (const key of ["type", "title", "description", "status"] as const) {
    const value = getField(map, key);

    if (!isBlankValue(value) && value.kind !== "string") {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W117",
        `quote ${key}: it parses as ${value.kind}, not a string (section 4)`
      );
    }
  }

  const tagsValue = getField(map, "tags");

  if (!isBlankValue(tagsValue) && tagsValue.kind !== "seq") {
    const commaHint =
      tagsValue.kind === "string" && tagsValue.value.includes(",")
        ? `; consumers read it as the single tag ${JSON.stringify(tagsValue.value)}`
        : "";

    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W110",
      `write tags as a YAML list (sections 4.1 and 11.2)${commaHint}`
    );
  }

  const statusValue = getOptionalString(map, "status");

  if (statusValue !== null && !VALID_STATUSES.has(statusValue)) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W105",
      `status is draft, stable, or deprecated; consumers treat ${JSON.stringify(statusValue)} as not current (section 5.4)`
    );
  }

  const supersededBy = getField(map, "superseded_by");

  if (!isBlankValue(supersededBy)) {
    if (statusValue !== "deprecated") {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W123",
        "superseded_by has a meaning only with status: deprecated (section 5.4)"
      );
    }

    checkPathField(ctx, filePath, "superseded_by", supersededBy);
  }
};

const checkConceptGenerated = (
  ctx: ValidationContext,
  filePath: string,
  map: OkfYamlMap
): Date | null => {
  const generatedValue = getField(map, "generated");

  if (isBlankValue(generatedValue)) {
    return null;
  }

  if (
    generatedValue.kind !== "map" ||
    isBlankValue(getField(generatedValue, "by"))
  ) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W102",
      "generated is a mapping with a by field (section 5.2)"
    );

    return null;
  }

  checkActor(ctx, filePath, "generated.by", getField(generatedValue, "by"));

  const atValue = getField(generatedValue, "at");

  if (isBlankValue(atValue)) {
    return null;
  }

  const checked = checkTimestampValue(ctx, filePath, "generated.at", atValue);

  if (
    checked.date !== null &&
    checked.raw !== null &&
    DATE_REGEX.test(checked.raw)
  ) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W122",
      "write generated.at as a date-time, because consumers compare it with verified[].at (section 5)"
    );
  }

  return checked.date;
};

const checkConceptVerified = (
  ctx: ValidationContext,
  filePath: string,
  map: OkfYamlMap,
  generatedAt: Date | null
): void => {
  const verifiedDates: Date[] = [];
  const verifiedEntries = asValueList(getField(map, "verified"));

  for (let index = 0; index < verifiedEntries.length; index += 1) {
    const entry = verifiedEntries[index];
    const field = `verified[${String(index)}]`;

    if (
      entry === undefined ||
      entry.kind !== "map" ||
      isBlankValue(getField(entry, "by")) ||
      isBlankValue(getField(entry, "at"))
    ) {
      ctx.addFinding(
        filePath,
        1,
        "warning",
        "W104",
        `${field} needs by and at; consumers ignore it (section 5.2)`
      );
      continue;
    }

    checkActor(ctx, filePath, `${field}.by`, getField(entry, "by"));

    const checked = checkTimestampValue(
      ctx,
      filePath,
      `${field}.at`,
      getField(entry, "at")
    );

    if (checked.date !== null) {
      verifiedDates.push(checked.date);

      if (checked.raw !== null && DATE_REGEX.test(checked.raw)) {
        ctx.addFinding(
          filePath,
          1,
          "warning",
          "W122",
          `write ${field}.at as a date-time, because consumers compare it with generated.at (section 5)`
        );
      }
    }
  }

  if (
    verifiedDates.length > 0 &&
    generatedAt !== null &&
    verifiedDates.every((moment) => moment.getTime() < generatedAt.getTime())
  ) {
    ctx.addFinding(
      filePath,
      1,
      "info",
      "I204",
      "no verification is current: each verified event is older than generated.at, so consumers read the concept as unverified (section 5.3)"
    );
  }
};

const checkConceptStaleAfter = (
  ctx: ValidationContext,
  filePath: string,
  map: OkfYamlMap
): void => {
  const staleAfterValue = getField(map, "stale_after");

  if (isBlankValue(staleAfterValue)) {
    return;
  }

  const parsed =
    staleAfterValue.kind === "string"
      ? parseOkfTimestamp(staleAfterValue.value)
      : null;

  if (parsed === null) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W101",
      `stale_after does not parse, so consumers never treat the concept as fresh (section 5.5); found ${describeYamlValue(staleAfterValue)}`
    );
  } else if (ctx.now.getTime() >= parsed.getTime()) {
    ctx.addFinding(
      filePath,
      1,
      "info",
      "I201",
      `the concept is stale: stale_after ${describeYamlValue(staleAfterValue)} has passed (section 5.5)`
    );
  }
};

const checkConceptFile = (
  ctx: ValidationContext,
  filePath: string,
  text: string
): void => {
  const parsed = splitFrontmatter(text);

  if (parsed.kind === "absent") {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W120",
      "not a concept: the file has no frontmatter (section 3.2)"
    );

    return;
  }

  if (parsed.kind === "error") {
    ctx.addFinding(filePath, parsed.line, "error", parsed.code, parsed.message);

    return;
  }

  for (const warning of parsed.warnings) {
    ctx.addFinding(filePath, warning.line, "warning", "W127", warning.message);
  }

  const conceptType = getOptionalString(parsed.map, "type");

  if (conceptType === null || conceptType.trim().length === 0) {
    ctx.addFinding(
      filePath,
      1,
      "warning",
      "W120",
      "not a concept: the frontmatter has no non-empty type (section 3.2)"
    );

    return;
  }

  checkConceptCoreFields(ctx, filePath, parsed.map);

  const generatedAt = checkConceptGenerated(ctx, filePath, parsed.map);

  checkConceptVerified(ctx, filePath, parsed.map, generatedAt);
  checkConceptStaleAfter(ctx, filePath, parsed.map);

  const sourceIds = checkConceptSources(ctx, filePath, parsed.map);
  const resourceValue = getField(parsed.map, "resource");

  if (!isBlankValue(resourceValue)) {
    checkPathField(ctx, filePath, "resource", resourceValue);
  }

  checkConceptBody(ctx, filePath, parsed.body, parsed.bodyLine, sourceIds);

  if (conceptType === "Attested Computation") {
    checkAttestedComputation(ctx, filePath, parsed.map, parsed.body);
  }

  const unknownKeys: string[] = [];

  for (const key of parsed.map.entries.keys()) {
    if (!KNOWN_CONCEPT_KEYS.has(key) && !key.startsWith("x-")) {
      unknownKeys.push(key);
    }
  }

  if (unknownKeys.length > 0) {
    ctx.addFinding(
      filePath,
      1,
      "info",
      "I203",
      `extension keys without the x- prefix: ${unknownKeys.toSorted().join(", ")} (section 4.1)`
    );
  }
};

export const validateOkfBundle = (
  bundleRootInput: string,
  options?: { readonly now?: Date }
): OkfValidationReport => {
  const bundleRoot = path.resolve(bundleRootInput);
  const now = options?.now ?? new Date();
  const rootMeta = readRootMetadata(bundleRoot);
  const findings: OkfFinding[] = [];

  const ctx: ValidationContext = {
    addFinding: (filePath, line, level, code, message) => {
      findings.push({
        code,
        level,
        line,
        message,
        path: toPosixRelative(bundleRoot, filePath),
      });
    },
    bundleRoot,
    now,
    rootFallback: usesV02RootFallback(rootMeta.okfVersion),
  };

  if (!fs.existsSync(path.join(bundleRoot, "index.md"))) {
    ctx.addFinding(
      bundleRoot,
      null,
      "warning",
      "W125",
      'add a bundle-root index.md with okf_version: "0.3" (section 8.1)'
    );
  }

  const files = collectMarkdownFiles(bundleRoot);

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const text = fs.readFileSync(filePath, "utf-8");

    if (fileName === "index.md") {
      checkIndexFile(ctx, filePath, text);
    } else if (fileName === "log.md") {
      checkLogFile(ctx, filePath, text);
    } else {
      checkConceptFile(ctx, filePath, text);
    }
  }

  let errorCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  for (const finding of findings) {
    if (finding.level === "error") {
      errorCount += 1;
    } else if (finding.level === "warning") {
      warningCount += 1;
    } else {
      infoCount += 1;
    }
  }

  return {
    bundle: bundleRoot,
    errors: errorCount,
    filesChecked: files.length,
    findings,
    info: infoCount,
    okfVersion: rootMeta.okfVersion,
    warnings: warningCount,
  };
};

const resolveConceptId = (
  bundleRoot: string,
  sourceFile: string,
  target: string,
  allowRootFallback: boolean
): string | null => {
  const resolved = resolveBundlePath(
    bundleRoot,
    sourceFile,
    target,
    allowRootFallback
  );

  if (
    resolved.resolvedPath === null ||
    !resolved.resolvedPath.endsWith(".md") ||
    !fs.statSync(resolved.resolvedPath).isFile()
  ) {
    return null;
  }

  return toPosixRelative(bundleRoot, resolved.resolvedPath).slice(0, -3);
};

const computeTrustState = (map: OkfYamlMap): TrustSummaryState => {
  const generatedValue = getField(map, "generated");

  const generatedAtFromBlock =
    generatedValue.kind === "map"
      ? getOptionalString(generatedValue, "at")
      : null;

  const generatedAtText =
    generatedAtFromBlock ?? getOptionalString(map, "timestamp");

  const generatedAt =
    generatedAtText === null ? null : parseOkfTimestamp(generatedAtText);

  const validVerifiedEvents: { readonly at: Date; readonly by: string }[] = [];

  for (const entry of asValueList(getField(map, "verified"))) {
    if (entry.kind !== "map") {
      continue;
    }

    const by = getOptionalString(entry, "by");
    const atText = getOptionalString(entry, "at");
    const at = atText === null ? null : parseOkfTimestamp(atText);

    if (by !== null && at !== null) {
      validVerifiedEvents.push({ at, by });
    }
  }

  const currentVerifiedEvents = validVerifiedEvents.filter(
    (event) =>
      generatedAt === null || event.at.getTime() >= generatedAt.getTime()
  );

  let trust: OkfTrustTier = "unverified";

  if (currentVerifiedEvents.length > 0) {
    trust = currentVerifiedEvents.some((event) => event.by.startsWith("human:"))
      ? "human-reviewed"
      : "machine-confirmed";
  }

  const verifiedBeforeChange =
    validVerifiedEvents.length > 0 && currentVerifiedEvents.length === 0;

  return {
    generatedAtText,
    notes: verifiedBeforeChange ? ["verified only before the last change"] : [],
    trust,
    verifiedBeforeChange,
  };
};

const computeFreshnessState = (
  map: OkfYamlMap,
  now: Date
): FreshnessSummaryState => {
  const staleAfterValue = getField(map, "stale_after");

  if (isBlankValue(staleAfterValue)) {
    return { notes: [], stale: false, staleAfter: null };
  }

  const staleAfterRaw =
    formatYamlScalarText(staleAfterValue) ?? describeYamlValue(staleAfterValue);

  const staleAfterDate =
    staleAfterValue.kind === "string"
      ? parseOkfTimestamp(staleAfterValue.value)
      : null;

  const malformedStale = staleAfterDate === null;

  const notes = malformedStale
    ? [
        `stale_after ${JSON.stringify(staleAfterRaw)} is malformed, so the concept counts as stale`,
      ]
    : [];

  return {
    notes,
    stale: malformedStale || now.getTime() >= staleAfterDate.getTime(),
    staleAfter: staleAfterRaw,
  };
};

const summarizeConcept = (
  bundleRoot: string,
  filePath: string,
  map: OkfYamlMap,
  now: Date,
  rootFallback: boolean
): OkfConceptSummary => {
  const relativePosix = toPosixRelative(bundleRoot, filePath);
  const conceptId = relativePosix.slice(0, -3);
  const conceptType = getOptionalString(map, "type") ?? "";
  const trustState = computeTrustState(map);
  const freshnessState = computeFreshnessState(map, now);
  const status = getOptionalString(map, "status") ?? "stable";

  const notes = [...trustState.notes, ...freshnessState.notes];

  if (!VALID_STATUSES.has(status)) {
    notes.push(`unknown status ${JSON.stringify(status)}: not current`);
  }

  const supersededBy = getOptionalString(map, "superseded_by");

  const replacementId =
    status === "deprecated" && supersededBy !== null
      ? resolveConceptId(bundleRoot, filePath, supersededBy, rootFallback)
      : null;

  const tags: string[] = [];

  for (const tagValue of asValueList(getField(map, "tags"))) {
    const tagText = formatYamlScalarText(tagValue);

    if (tagText !== null && tagText.length > 0) {
      tags.push(tagText);
    }
  }

  const fallbackTitle = path
    .basename(filePath, ".md")
    .replaceAll(/[-_]+/gu, " ")
    .trim();

  return {
    current: CURRENT_STATUSES.has(status),
    description: getOptionalString(map, "description"),
    generatedAt: trustState.generatedAtText,
    id: conceptId,
    notes,
    path: relativePosix,
    replacementId,
    resource: getOptionalString(map, "resource"),
    runtime: getOptionalString(map, "runtime"),
    stale: freshnessState.stale,
    staleAfter: freshnessState.staleAfter,
    status,
    supersededBy,
    tags,
    title: getOptionalString(map, "title") ?? fallbackTitle,
    trust: trustState.trust,
    type: conceptType,
    verifiedBeforeChange: trustState.verifiedBeforeChange,
  };
};

const matchesScanFilter = (
  concept: OkfConceptSummary,
  bundleRoot: string,
  options: OkfScanOptions
): boolean => {
  if (
    options.type !== undefined &&
    concept.type.toLowerCase() !== options.type.toLowerCase()
  ) {
    return false;
  }

  if (
    options.tag !== undefined &&
    !concept.tags.some(
      (tag) => tag.toLowerCase() === options.tag?.toLowerCase()
    )
  ) {
    return false;
  }

  if (options.grep !== undefined) {
    const fileText = fs.readFileSync(
      path.join(bundleRoot, concept.path),
      "utf-8"
    );

    const haystack = `${concept.id} ${concept.title} ${fileText}`.toLowerCase();

    if (!haystack.includes(options.grep.toLowerCase())) {
      return false;
    }
  }

  if (options.currentOnly === true && !concept.current) {
    return false;
  }

  if (options.staleOnly === true && !concept.stale) {
    return false;
  }

  if (options.deprecatedOnly === true && concept.status !== "deprecated") {
    return false;
  }

  return !(options.unverifiedOnly === true && concept.trust !== "unverified");
};

export const scanOkfBundle = (
  bundleRootInput: string,
  options: OkfScanOptions = {}
): OkfScanReport => {
  const bundleRoot = path.resolve(bundleRootInput);
  const now = options.now ?? new Date();
  const rootMeta = readRootMetadata(bundleRoot);
  const rootFallback = usesV02RootFallback(rootMeta.okfVersion);

  const concepts: OkfConceptSummary[] = [];
  const notConcepts: OkfNonConceptEntry[] = [];

  for (const filePath of collectMarkdownFiles(bundleRoot)) {
    const fileName = path.basename(filePath);

    if (fileName === "index.md" || fileName === "log.md") {
      continue;
    }

    const relativePosix = toPosixRelative(bundleRoot, filePath);
    const parsed = splitFrontmatter(fs.readFileSync(filePath, "utf-8"));

    if (parsed.kind === "absent") {
      notConcepts.push({ path: relativePosix, reason: "no frontmatter" });
      continue;
    }

    if (parsed.kind === "error") {
      notConcepts.push({ path: relativePosix, reason: parsed.message });
      continue;
    }

    const conceptType = getOptionalString(parsed.map, "type");

    if (conceptType === null || conceptType.trim().length === 0) {
      notConcepts.push({ path: relativePosix, reason: "no type" });
      continue;
    }

    concepts.push(
      summarizeConcept(bundleRoot, filePath, parsed.map, now, rootFallback)
    );
  }

  const selected = concepts.filter((concept) =>
    matchesScanFilter(concept, bundleRoot, options)
  );

  const typeCounts = new Map<string, number>();
  let humanReviewed = 0;
  let machineConfirmed = 0;
  let unverified = 0;
  let staleCount = 0;
  let deprecatedCount = 0;
  let draftCount = 0;
  let notCurrentCount = 0;

  for (const concept of concepts) {
    typeCounts.set(concept.type, (typeCounts.get(concept.type) ?? 0) + 1);

    if (concept.trust === "human-reviewed") {
      humanReviewed += 1;
    } else if (concept.trust === "machine-confirmed") {
      machineConfirmed += 1;
    } else {
      unverified += 1;
    }

    if (concept.stale) {
      staleCount += 1;
    }

    if (concept.status === "deprecated") {
      deprecatedCount += 1;
    }

    if (concept.status === "draft") {
      draftCount += 1;
    }

    if (!concept.current) {
      notCurrentCount += 1;
    }
  }

  const sortedTypes = [...typeCounts.entries()]
    .map(([type, count]) => ({ count, type }))
    .toSorted(
      (left, right) =>
        right.count - left.count || left.type.localeCompare(right.type)
    );

  return {
    bundle: {
      description: rootMeta.description,
      license: rootMeta.license,
      path: bundleRoot,
      title: rootMeta.title,
    },
    concepts: selected,
    notConcepts,
    now: now.toISOString(),
    okfVersion: rootMeta.okfVersion,
    summary: {
      concepts: concepts.length,
      deprecated: deprecatedCount,
      draft: draftCount,
      notConcepts: notConcepts.length,
      notCurrent: notCurrentCount,
      selected: selected.length,
      stale: staleCount,
      trust: {
        "human-reviewed": humanReviewed,
        "machine-confirmed": machineConfirmed,
        unverified,
      },
      types: sortedTypes,
    },
  };
};
