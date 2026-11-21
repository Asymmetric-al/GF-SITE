import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { parseOkfTimestamp, validateOkfBundle } from "./okf";

const repoRoot = path.resolve(import.meta.dirname, "..");

let bundleArg = path.join(repoRoot, "knowledge");
let jsonMode = false;
let strictMode = false;
let nowOverride: Date | undefined;

const USAGE = `Usage: bun scripts/okf-validate.ts [BUNDLE_ROOT] [--strict] [--json] [--now RFC3339]

Check an OKF v0.3 bundle (default: knowledge/) for conformance and field shape.

Options:
  --strict          Exit 1 when warnings are present
  --json            Emit findings as structured JSON
  --now <datetime>  Override current time for staleness checks
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
  } else if (token === "--strict") {
    strictMode = true;
  } else if (token === "--now") {
    const rawNow = argv[index + 1];
    index += 1;

    if (rawNow === undefined) {
      process.stderr.write("okf-validate: --now requires an RFC 3339 value\n");
      process.exit(2);
    }

    const parsed = parseOkfTimestamp(rawNow);

    if (parsed === null) {
      process.stderr.write(
        "okf-validate: --now must be an RFC 3339 date-time with an offset\n"
      );
      process.exit(2);
    }

    nowOverride = parsed;
  } else if (token.startsWith("-")) {
    process.stderr.write(`okf-validate: unknown option ${token}\n`);
    process.exit(2);
  } else {
    bundleArg = path.resolve(process.cwd(), token);
  }
}

if (!fs.existsSync(bundleArg) || !fs.statSync(bundleArg).isDirectory()) {
  process.stderr.write(`okf-validate: ${bundleArg} is not a directory\n`);
  process.exit(2);
}

const report = validateOkfBundle(bundleArg, { now: nowOverride });

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  for (const finding of report.findings) {
    const location =
      finding.line === null
        ? finding.path
        : `${finding.path}:${String(finding.line)}`;

    process.stdout.write(
      `${location}: ${finding.level} ${finding.code} ${finding.message}\n`
    );
  }

  const verdict = report.errors === 0 ? "conformant" : "not conformant";

  process.stdout.write(
    `${String(report.filesChecked)} files checked: ${String(report.errors)} errors, ${String(report.warnings)} warnings, ${String(report.info)} info. The bundle is ${verdict}.\n`
  );
}

if (report.errors > 0 || (strictMode && report.warnings > 0)) {
  process.exit(1);
}
