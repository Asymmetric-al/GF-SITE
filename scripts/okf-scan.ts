import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import type { OkfConceptSummary } from "./okf";
import { parseOkfTimestamp, scanOkfBundle } from "./okf";

const repoRoot = path.resolve(import.meta.dirname, "..");

let bundleArg = path.join(repoRoot, "knowledge");
let jsonMode = false;
let typeFilter: string | undefined;
let tagFilter: string | undefined;
let grepFilter: string | undefined;
let currentOnly = false;
let staleOnly = false;
let deprecatedOnly = false;
let unverifiedOnly = false;
let nowOverride: Date | undefined;

const requireFlagValue = (flag: string, value: string | undefined): string => {
  if (value === undefined) {
    process.stderr.write(`okf-scan: ${flag} requires a value\n`);
    process.exit(2);
  }

  return value;
};

const USAGE = `Usage: bun scripts/okf-scan.ts [BUNDLE_ROOT] [options]

List concepts in an OKF v0.3 bundle (default: knowledge/) with trust tier, status, and freshness.

Options:
  --type <name>     Filter by concept type (case-insensitive)
  --tag <name>      Filter by tag (case-insensitive)
  --grep <text>     Filter by substring match across ID, title, and file contents
  --current         Only current concepts (stable or draft)
  --stale           Only stale concepts (including malformed stale_after)
  --deprecated      Only deprecated concepts
  --unverified      Only unverified concepts
  --now <datetime>  Override current time for staleness checks
  --json            Emit scan report as structured JSON
  -h, --help        Show this help message
`;

const argv = process.argv.slice(2);

for (let index = 0; index < argv.length; index += 1) {
  const token = argv[index];

  if (token === undefined) {
    continue;
  }

  if (token === "-h" || token === "--help") {
    process.stdout.write(USAGE);
    process.exit(0);
  } else if (token === "--json") {
    jsonMode = true;
  } else if (token === "--current") {
    currentOnly = true;
  } else if (token === "--stale") {
    staleOnly = true;
  } else if (token === "--deprecated") {
    deprecatedOnly = true;
  } else if (token === "--unverified") {
    unverifiedOnly = true;
  } else if (token === "--type") {
    typeFilter = requireFlagValue("--type", argv[index + 1]);
    index += 1;
  } else if (token === "--tag") {
    tagFilter = requireFlagValue("--tag", argv[index + 1]);
    index += 1;
  } else if (token === "--grep") {
    grepFilter = requireFlagValue("--grep", argv[index + 1]);
    index += 1;
  } else if (token === "--now") {
    const rawNow = requireFlagValue("--now", argv[index + 1]);
    index += 1;
    const parsed = parseOkfTimestamp(rawNow);

    if (parsed === null) {
      process.stderr.write(
        "okf-scan: --now must be an RFC 3339 date-time with an offset\n"
      );
      process.exit(2);
    }

    nowOverride = parsed;
  } else if (token.startsWith("-")) {
    process.stderr.write(`okf-scan: unknown option ${token}\n`);
    process.exit(2);
  } else {
    bundleArg = path.resolve(process.cwd(), token);
  }
}

if (!fs.existsSync(bundleArg) || !fs.statSync(bundleArg).isDirectory()) {
  process.stderr.write(`okf-scan: ${bundleArg} is not a directory\n`);
  process.exit(2);
}

const formatFreshness = (concept: OkfConceptSummary): string => {
  if (concept.stale) {
    if (
      concept.staleAfter !== null &&
      concept.notes.some((note) => note.includes("malformed"))
    ) {
      return "stale (malformed stale_after)";
    }

    return `stale since ${concept.staleAfter ?? "unknown"}`;
  }

  if (concept.staleAfter !== null) {
    return `fresh until ${concept.staleAfter}`;
  }

  return "no stale_after";
};

const report = scanOkfBundle(bundleArg, {
  currentOnly,
  deprecatedOnly,
  grep: grepFilter,
  now: nowOverride,
  staleOnly,
  tag: tagFilter,
  type: typeFilter,
  unverifiedOnly,
});

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.exit(0);
}

const bundleName = report.bundle.title ?? path.basename(report.bundle.path);

process.stdout.write(
  `Bundle ${bundleName}: ${String(report.summary.concepts)} concepts, okf_version ${report.okfVersion ?? "not declared"}, now ${report.now}\n`
);

if (report.bundle.description !== null) {
  process.stdout.write(`Scope: ${report.bundle.description}\n`);
}

const typeSummary =
  report.summary.types.length > 0
    ? report.summary.types
        .map((entry) => `${entry.type} ${String(entry.count)}`)
        .join(", ")
    : "none";

process.stdout.write(`Types: ${typeSummary}\n`);

process.stdout.write(
  `Trust: human-reviewed ${String(report.summary.trust["human-reviewed"])}, machine-confirmed ${String(report.summary.trust["machine-confirmed"])}, unverified ${String(report.summary.trust.unverified)}. Stale ${String(report.summary.stale)}, deprecated ${String(report.summary.deprecated)}, draft ${String(report.summary.draft)}, not current ${String(report.summary.notCurrent)}.\n`
);

if (report.notConcepts.length > 0) {
  process.stdout.write(
    `Skipped ${String(report.notConcepts.length)} Markdown files that are not concepts: ${report.notConcepts
      .map((entry) => `${entry.path} (${entry.reason})`)
      .join(", ")}\n`
  );
}

if (report.summary.selected !== report.summary.concepts) {
  process.stdout.write(
    `Showing ${String(report.summary.selected)} concepts that match the filters.\n`
  );
}

for (const concept of report.concepts) {
  const replacementSuffix =
    concept.status === "deprecated" && concept.supersededBy !== null
      ? `, superseded by ${concept.replacementId ?? concept.supersededBy}`
      : "";

  process.stdout.write(
    `\n${concept.id}  [${concept.type}]  ${concept.trust}, ${concept.status}, ${formatFreshness(concept)}${replacementSuffix}\n`
  );
  process.stdout.write(
    `    ${concept.title}${concept.description === null ? "" : `: ${concept.description}`}\n`
  );

  for (const note of concept.notes) {
    process.stdout.write(`    note: ${note}\n`);
  }
}
